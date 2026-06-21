import { describe, expect, it } from 'vitest'
import { createMockAudioContext } from '../../test/mockAudioContext'
import { DEFAULT_CONFIG, type GeneratorConfig } from '../types'
import {
  AmVoice,
  BinauralVoice,
  IsochronicVoice,
  MonauralVoice,
  createVoice,
} from './index'

function cfg(patch: Partial<GeneratorConfig> = {}): GeneratorConfig {
  return { ...DEFAULT_CONFIG, ...patch }
}

// The voices accept a BaseAudioContext; the mock stands in for the subset used.
function ctx() {
  return createMockAudioContext()
}

describe('BinauralVoice', () => {
  it('detunes each ear by half the beat frequency', () => {
    const c = ctx()
    const voice = new BinauralVoice(
      c as unknown as BaseAudioContext,
      cfg({ carrierHz: 200, beatHz: 6 }),
    )
    expect(c.oscillators).toHaveLength(2)
    const [left, right] = c.oscillators
    expect(left.frequency.value).toBe(197)
    expect(right.frequency.value).toBe(203)

    voice.start()
    expect(left.started && right.started).toBe(true)
    voice.stop()
    expect(left.stopped && right.stopped).toBe(true)
  })

  it('is idempotent on repeated start/stop', () => {
    const c = ctx()
    const voice = new BinauralVoice(c as unknown as BaseAudioContext, cfg())
    voice.start()
    voice.start() // should not throw or re-start
    voice.stop()
    voice.stop()
    expect(c.oscillators.every((o) => o.started && o.stopped)).toBe(true)
  })
})

describe('MonauralVoice', () => {
  it('sums two tones offset by the beat frequency at half gain', () => {
    const c = ctx()
    new MonauralVoice(
      c as unknown as BaseAudioContext,
      cfg({ carrierHz: 200, beatHz: 6 }),
    )
    expect(c.oscillators.map((o) => o.frequency.value)).toEqual([200, 206])
    const halfGains = c.gains.filter((g) => g.gain.value === 0.5)
    expect(halfGains).toHaveLength(2)
  })
})

describe('AmVoice', () => {
  it('modulates the carrier gain around the envelope midpoint', () => {
    const c = ctx()
    new AmVoice(
      c as unknown as BaseAudioContext,
      cfg({ carrierHz: 200, beatHz: 10, modDepth: 0.8 }),
    )
    const [carrier, lfo] = c.oscillators
    expect(carrier.frequency.value).toBe(200)
    expect(lfo.frequency.value).toBe(10)
    // envelope [0.2, 1] -> midpoint 0.6, swing 0.4
    expect(c.gains[1].gain.value).toBeCloseTo(0.6)
    expect(c.gains[2].gain.value).toBeCloseTo(0.4)
  })
})

describe('IsochronicVoice', () => {
  it('starts gated silent and tracks the carrier on update', () => {
    const c = ctx()
    const voice = new IsochronicVoice(
      c as unknown as BaseAudioContext,
      cfg({ method: 'isochronic', carrierHz: 300 }),
    )
    expect(c.oscillators[0].frequency.value).toBe(300)
    // gate gain starts at 0 (silent until the scheduler opens it)
    const gate = c.gains.find((g) => g.gain.value === 0)
    expect(gate).toBeDefined()

    voice.update(cfg({ method: 'isochronic', carrierHz: 250 }))
    expect(c.oscillators[0].frequency.value).toBe(250)
    voice.dispose()
  })
})

describe('createVoice', () => {
  it('builds the voice matching the configured method', () => {
    const c = ctx() as unknown as BaseAudioContext
    expect(createVoice(c, cfg({ method: 'binaural' }))).toBeInstanceOf(BinauralVoice)
    expect(createVoice(c, cfg({ method: 'monaural' }))).toBeInstanceOf(MonauralVoice)
    expect(createVoice(c, cfg({ method: 'am' }))).toBeInstanceOf(AmVoice)
    expect(createVoice(c, cfg({ method: 'isochronic' }))).toBeInstanceOf(
      IsochronicVoice,
    )
  })
})
