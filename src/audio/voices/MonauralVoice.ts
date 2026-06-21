import { monauralFrequencies } from '../beatMath'
import type { GeneratorConfig } from '../types'
import { BaseVoice } from './Voice'

/**
 * Monaural beats: two tones summed into a single (mono) signal *before* it
 * reaches the ears. The beat is acoustically real — present in the waveform
 * itself — so it works on speakers, no headphones needed.
 */
export class MonauralVoice extends BaseVoice {
  private readonly oscA: OscillatorNode
  private readonly oscB: OscillatorNode

  constructor(ctx: BaseAudioContext, config: GeneratorConfig) {
    super(ctx)
    this.oscA = this.track(ctx.createOscillator())
    this.oscB = this.track(ctx.createOscillator())

    // Half-gain each so the summed peak stays within [-1, 1].
    const mixA = this.track(ctx.createGain())
    const mixB = this.track(ctx.createGain())
    mixA.gain.value = 0.5
    mixB.gain.value = 0.5

    this.oscA.connect(mixA).connect(this.output)
    this.oscB.connect(mixB).connect(this.output)

    this.update(config)
  }

  update(config: GeneratorConfig): void {
    const { a, b } = monauralFrequencies(config.carrierHz, config.beatHz)
    this.oscA.type = config.waveform
    this.oscB.type = config.waveform
    this.oscA.frequency.value = a
    this.oscB.frequency.value = b
  }

  start(): void {
    if (this.started) return
    this.started = true
    this.oscA.start()
    this.oscB.start()
  }

  stop(): void {
    if (!this.started || this.stopped) return
    this.stopped = true
    this.oscA.stop()
    this.oscB.stop()
  }
}
