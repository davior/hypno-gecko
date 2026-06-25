import { makeNoiseBuffer } from '../noise'
import type { AmbientConfig, NoiseType } from '../types'

/**
 * An ambient noise bed: a looping coloured-noise source through a low-pass
 * "tone" filter into its own gain. Independent of the beat layer, with its own
 * volume so the two can be balanced freely.
 *
 * The noise colour is baked into the buffer, so changing `type` requires a new
 * layer — the engine rebuilds rather than mutating in place.
 */
export class AmbientLayer {
  readonly output: GainNode
  readonly type: NoiseType
  private readonly src: AudioBufferSourceNode
  private readonly filter: BiquadFilterNode
  private started = false
  private stopped = false

  constructor(ctx: BaseAudioContext, config: AmbientConfig) {
    this.type = config.type
    this.output = ctx.createGain()
    this.filter = ctx.createBiquadFilter()
    this.filter.type = 'lowpass'

    this.src = ctx.createBufferSource()
    this.src.buffer = makeNoiseBuffer(ctx, config.type)
    this.src.loop = true

    this.src.connect(this.filter).connect(this.output)
    this.update(config)
  }

  /** Apply live-adjustable settings (volume, tone). Type changes need a rebuild. */
  update(config: AmbientConfig): void {
    this.output.gain.value = config.volume
    this.filter.frequency.value = config.toneHz
  }

  start(): void {
    if (this.started) return
    this.started = true
    this.src.start()
  }

  stop(): void {
    if (!this.started || this.stopped) return
    this.stopped = true
    this.src.stop()
  }

  dispose(): void {
    try {
      this.src.disconnect()
    } catch {
      // already disconnected
    }
    try {
      this.filter.disconnect()
    } catch {
      // already disconnected
    }
    try {
      this.output.disconnect()
    } catch {
      // already disconnected
    }
  }
}
