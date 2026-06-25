import { AmbientLayer } from './layers/AmbientLayer'
import { clamp, rampedBeatAt } from './beatMath'
import type { AmbientConfig, GeneratorConfig } from './types'
import { createVoice, type Voice } from './voices'

export type EngineState = 'idle' | 'playing'
type Listener = (state: EngineState) => void

/**
 * Owns the single AudioContext and the currently-sounding Voice.
 *
 * Browsers require an AudioContext to be created/resumed inside a user
 * gesture, so the context is built lazily on the first `play()` call.
 */
export class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private voice: Voice | null = null
  private state: EngineState = 'idle'
  private listeners = new Set<Listener>()

  private rampTimer: ReturnType<typeof setInterval> | null = null
  private rampStartAt = 0
  private rampFromBeat = 0
  private config: GeneratorConfig | null = null

  private ambient: AmbientLayer | null = null
  private ambientConfig: AmbientConfig | null = null

  /** Whether the Web Audio API is available in this environment. */
  static get isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      (typeof window.AudioContext !== 'undefined' ||
        typeof (window as { webkitAudioContext?: unknown }).webkitAudioContext !==
          'undefined')
    )
  }

  get isPlaying(): boolean {
    return this.state === 'playing'
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private setState(state: EngineState): void {
    if (this.state === state) return
    this.state = state
    for (const l of this.listeners) l(state)
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      this.ctx = new Ctor()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0
      this.master.connect(this.ctx.destination)
    }
    return this.ctx
  }

  /** Start (or restart) playback with the given configuration. */
  async play(config: GeneratorConfig, ambient?: AmbientConfig): Promise<void> {
    const ctx = this.ensureContext()
    if (ctx.state === 'suspended') await ctx.resume()

    this.teardownVoice()
    this.disposeAmbientNow()
    this.config = config

    this.voice = createVoice(ctx, config)
    this.voice.output.connect(this.master!)
    this.voice.start()

    const amb = ambient ?? this.ambientConfig
    if (amb) {
      this.ambientConfig = amb
      if (amb.enabled) this.buildAmbient(amb)
    }

    // Soft fade-in to avoid a click.
    const now = ctx.currentTime
    this.master!.gain.cancelScheduledValues(now)
    this.master!.gain.setValueAtTime(this.master!.gain.value, now)
    this.master!.gain.linearRampToValueAtTime(
      clamp(config.masterVolume, 0, 1),
      now + 0.05,
    )

    this.startRamp(config)
    this.setState('playing')
  }

  /** Update live parameters without restarting (carrier, beat, volume, ...). */
  update(config: GeneratorConfig): void {
    this.config = config
    if (this.voice) this.voice.update(config)
    this.setVolume(config.masterVolume)
  }

  setVolume(volume: number): void {
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(
        clamp(volume, 0, 1),
        this.ctx.currentTime,
        0.02,
      )
    }
  }

  /** Stop playback with a short fade-out. */
  stop(): void {
    this.stopRamp()
    if (this.master && this.ctx) {
      const now = this.ctx.currentTime
      this.master.gain.cancelScheduledValues(now)
      this.master.gain.setValueAtTime(this.master.gain.value, now)
      this.master.gain.linearRampToValueAtTime(0, now + 0.08)
    }
    // Defer teardown until after the fade so we don't click.
    const voice = this.voice
    const ambient = this.ambient
    this.voice = null
    this.ambient = null
    window.setTimeout(() => {
      if (voice) {
        try {
          voice.stop()
        } catch {
          // already stopped
        }
        voice.dispose()
      }
      if (ambient) {
        try {
          ambient.stop()
        } catch {
          // already stopped
        }
        ambient.dispose()
      }
    }, 140)
    this.setState('idle')
  }

  // --- Ambient layer (Module 4) ---

  /** Add, update, or remove the ambient layer live (or store for next play). */
  setAmbient(ambient: AmbientConfig): void {
    this.ambientConfig = ambient
    if (!this.isPlaying || !this.ctx) return

    if (!ambient.enabled) {
      this.fadeOutAmbient()
      return
    }
    if (!this.ambient) {
      this.buildAmbient(ambient)
    } else if (this.ambient.type !== ambient.type) {
      this.fadeOutAmbient()
      this.buildAmbient(ambient)
    } else {
      this.ambient.update(ambient)
    }
  }

  private buildAmbient(ambient: AmbientConfig): void {
    if (!this.ctx || !this.master) return
    const layer = new AmbientLayer(this.ctx, ambient)
    layer.output.connect(this.master)
    layer.start()
    // Fade the layer in independently of the master.
    const g = layer.output.gain
    const now = this.ctx.currentTime
    g.cancelScheduledValues(now)
    g.setValueAtTime(0, now)
    g.linearRampToValueAtTime(clamp(ambient.volume, 0, 1), now + 0.4)
    this.ambient = layer
  }

  private fadeOutAmbient(): void {
    const layer = this.ambient
    this.ambient = null
    if (!layer) return
    if (this.ctx) {
      const g = layer.output.gain
      const now = this.ctx.currentTime
      g.cancelScheduledValues(now)
      g.setValueAtTime(g.value, now)
      g.linearRampToValueAtTime(0, now + 0.25)
    }
    window.setTimeout(() => {
      try {
        layer.stop()
      } catch {
        // already stopped
      }
      layer.dispose()
    }, 300)
  }

  private disposeAmbientNow(): void {
    if (this.ambient) {
      try {
        this.ambient.stop()
      } catch {
        // already stopped
      }
      this.ambient.dispose()
      this.ambient = null
    }
  }

  private teardownVoice(): void {
    this.stopRamp()
    if (this.voice) {
      try {
        this.voice.stop()
      } catch {
        // already stopped
      }
      this.voice.dispose()
      this.voice = null
    }
  }

  // --- Beat-frequency ramp (e.g. Alpha 10 Hz -> Theta 6 Hz over a window) ---

  private startRamp(config: GeneratorConfig): void {
    this.stopRamp()
    if (!config.ramp.enabled || !this.ctx) return
    this.rampStartAt = this.ctx.currentTime
    this.rampFromBeat = config.beatHz
    this.rampTimer = setInterval(() => this.tickRamp(), 200)
  }

  private tickRamp(): void {
    if (!this.ctx || !this.voice || !this.config) return
    const elapsed = this.ctx.currentTime - this.rampStartAt
    const { targetBeatHz, durationSec } = this.config.ramp
    const beatHz = rampedBeatAt(
      this.rampFromBeat,
      targetBeatHz,
      durationSec,
      elapsed,
    )
    this.voice.update({ ...this.config, beatHz })
    if (elapsed >= durationSec) this.stopRamp()
  }

  private stopRamp(): void {
    if (this.rampTimer !== null) {
      clearInterval(this.rampTimer)
      this.rampTimer = null
    }
  }

  /** Current beat frequency accounting for an in-progress ramp, for UI display. */
  currentBeatHz(): number | null {
    if (!this.ctx || !this.config) return null
    if (!this.config.ramp.enabled || this.rampTimer === null) {
      return this.config.beatHz
    }
    const elapsed = this.ctx.currentTime - this.rampStartAt
    return rampedBeatAt(
      this.rampFromBeat,
      this.config.ramp.targetBeatHz,
      this.config.ramp.durationSec,
      elapsed,
    )
  }

  dispose(): void {
    this.teardownVoice()
    this.disposeAmbientNow()
    this.listeners.clear()
    if (this.ctx) {
      void this.ctx.close()
      this.ctx = null
      this.master = null
    }
  }
}

/** App-wide singleton engine. */
export const audioEngine = new AudioEngine()
