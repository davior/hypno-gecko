import { binauralFrequencies } from '../beatMath'
import type { GeneratorConfig } from '../types'
import { BaseVoice } from './Voice'

/**
 * Binaural beats: two oscillators, one hard-left and one hard-right, detuned
 * by the beat frequency. The beat is constructed in the brainstem, not in the
 * air — so headphones are required.
 */
export class BinauralVoice extends BaseVoice {
  private readonly oscL: OscillatorNode
  private readonly oscR: OscillatorNode
  private readonly merger: ChannelMergerNode

  constructor(ctx: BaseAudioContext, config: GeneratorConfig) {
    super(ctx)
    this.oscL = this.track(ctx.createOscillator())
    this.oscR = this.track(ctx.createOscillator())
    this.merger = this.track(ctx.createChannelMerger(2))

    this.oscL.connect(this.merger, 0, 0) // left channel
    this.oscR.connect(this.merger, 0, 1) // right channel
    this.merger.connect(this.output)

    this.update(config)
  }

  update(config: GeneratorConfig): void {
    const { left, right } = binauralFrequencies(config.carrierHz, config.beatHz)
    this.oscL.type = config.waveform
    this.oscR.type = config.waveform
    this.oscL.frequency.value = left
    this.oscR.frequency.value = right
  }

  start(): void {
    if (this.started) return
    this.started = true
    this.oscL.start()
    this.oscR.start()
  }

  stop(): void {
    if (!this.started || this.stopped) return
    this.stopped = true
    this.oscL.stop()
    this.oscR.stop()
  }
}
