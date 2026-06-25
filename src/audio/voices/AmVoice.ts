import { amEnvelope, clamp } from '../beatMath'
import type { GeneratorConfig } from '../types'
import { BaseVoice } from './Voice'

/**
 * Amplitude modulation: a single carrier whose loudness wavers at the beat
 * frequency. Produces a pulsing, breathing tone. Like monaural beats the
 * modulation is physically present in the signal, so headphones aren't
 * required.
 *
 * Signal: carrier(t) * gain(t), where
 *   gain(t) = base + (depth/2)·sin(2π·beat·t),  base = 1 - depth/2
 * giving an amplitude envelope of [1 - depth, 1].
 */
export class AmVoice extends BaseVoice {
  private readonly carrier: OscillatorNode
  private readonly modGain: GainNode
  private readonly lfo: OscillatorNode
  private readonly lfoDepth: GainNode

  constructor(ctx: BaseAudioContext, config: GeneratorConfig) {
    super(ctx)
    this.carrier = this.track(ctx.createOscillator())
    this.modGain = this.track(ctx.createGain())
    this.lfo = this.track(ctx.createOscillator())
    this.lfoDepth = this.track(ctx.createGain())

    this.lfo.type = 'sine'
    this.lfo.connect(this.lfoDepth).connect(this.modGain.gain)
    this.carrier.connect(this.modGain).connect(this.output)

    this.update(config)
  }

  update(config: GeneratorConfig): void {
    const depth = clamp(config.modDepth, 0, 1)
    const { min, max } = amEnvelope(depth)
    this.carrier.type = config.waveform
    this.carrier.frequency.value = config.carrierHz
    this.lfo.frequency.value = config.beatHz
    // base sits at the midpoint of the envelope; LFO swings ±depth/2 around it.
    this.modGain.gain.value = (min + max) / 2
    this.lfoDepth.gain.value = (max - min) / 2
  }

  start(): void {
    if (this.started) return
    this.started = true
    this.carrier.start()
    this.lfo.start()
  }

  stop(): void {
    if (!this.started || this.stopped) return
    this.stopped = true
    this.carrier.stop()
    this.lfo.stop()
  }
}
