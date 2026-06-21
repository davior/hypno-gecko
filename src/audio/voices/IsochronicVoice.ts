import { pulseOnDuration, pulsePeriod } from '../beatMath'
import type { GeneratorConfig } from '../types'
import { BaseVoice } from './Voice'

/**
 * Isochronic tones: a single tone switched fully on and off at the beat
 * frequency. The sharpest, most distinct entrainment signal — and the one
 * the spec flags as most effective for rapid entrainment.
 *
 * The on/off gate is driven by a look-ahead scheduler (the classic
 * "two clocks" pattern): a coarse JS timer queues precise gain envelopes
 * onto the audio clock a short horizon ahead, giving glitch-free pulses with
 * configurable duty cycle and edge softness.
 */
export class IsochronicVoice extends BaseVoice {
  private readonly osc: OscillatorNode
  private readonly gate: GainNode
  private config: GeneratorConfig
  private timer: ReturnType<typeof setInterval> | null = null
  private nextPulseStart = 0

  private static readonly LOOKAHEAD_SEC = 0.12
  private static readonly TICK_MS = 25

  constructor(ctx: BaseAudioContext, config: GeneratorConfig) {
    super(ctx)
    this.config = config
    this.osc = this.track(ctx.createOscillator())
    this.gate = this.track(ctx.createGain())
    this.gate.gain.value = 0
    this.osc.connect(this.gate).connect(this.output)
    this.osc.type = config.waveform
    this.osc.frequency.value = config.carrierHz
  }

  update(config: GeneratorConfig): void {
    this.config = config
    this.osc.type = config.waveform
    this.osc.frequency.value = config.carrierHz
    // beat / duty / ramp changes are picked up on the next scheduled pulse.
  }

  start(): void {
    if (this.started) return
    this.started = true
    this.osc.start()
    this.nextPulseStart = this.ctx.currentTime + 0.05
    this.tick()
    if (typeof setInterval !== 'undefined') {
      this.timer = setInterval(() => this.tick(), IsochronicVoice.TICK_MS)
    }
  }

  private tick(): void {
    const horizon = this.ctx.currentTime + IsochronicVoice.LOOKAHEAD_SEC
    // Guard against pathological loops if the clock ever fails to advance.
    let scheduled = 0
    while (this.nextPulseStart < horizon && scheduled < 64) {
      this.schedulePulse(this.nextPulseStart)
      this.nextPulseStart += pulsePeriod(this.config.beatHz)
      scheduled += 1
    }
  }

  private schedulePulse(at: number): void {
    const on = pulseOnDuration(this.config.beatHz, this.config.dutyCycle)
    const ramp = Math.min(this.config.gateRampMs / 1000, on / 2)
    const g = this.gate.gain

    g.setValueAtTime(0, at)
    g.linearRampToValueAtTime(1, at + ramp)
    g.setValueAtTime(1, at + on - ramp)
    g.linearRampToValueAtTime(0, at + on)
  }

  stop(): void {
    if (!this.started || this.stopped) return
    this.stopped = true
    this.clearTimer()
    try {
      this.gate.gain.cancelScheduledValues(this.ctx.currentTime)
    } catch {
      // no-op
    }
    this.gate.gain.value = 0
    this.osc.stop()
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  dispose(): void {
    this.clearTimer()
    super.dispose()
  }
}
