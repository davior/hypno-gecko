import { describe, expect, it } from 'vitest'
import {
  amEnvelope,
  binauralFrequencies,
  clamp,
  lerp,
  monauralFrequencies,
  pulseOnDuration,
  pulsePeriod,
  rampedBeatAt,
} from './beatMath'

describe('clamp', () => {
  it('bounds values to the range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-3, 0, 10)).toBe(0)
    expect(clamp(99, 0, 10)).toBe(10)
  })
  it('returns the minimum for NaN', () => {
    expect(clamp(Number.NaN, 2, 10)).toBe(2)
  })
})

describe('binauralFrequencies', () => {
  it('splits the beat symmetrically around the carrier', () => {
    expect(binauralFrequencies(200, 6)).toEqual({ left: 197, right: 203 })
  })
})

describe('monauralFrequencies', () => {
  it('offsets the second tone by the beat frequency', () => {
    expect(monauralFrequencies(200, 6)).toEqual({ a: 200, b: 206 })
  })
})

describe('amEnvelope', () => {
  it('is a steady tone at depth 0', () => {
    expect(amEnvelope(0)).toEqual({ min: 1, max: 1 })
  })
  it('fully silences between peaks at depth 1', () => {
    expect(amEnvelope(1)).toEqual({ min: 0, max: 1 })
  })
  it('half-modulates at depth 0.5', () => {
    expect(amEnvelope(0.5)).toEqual({ min: 0.5, max: 1 })
  })
})

describe('pulse timing', () => {
  it('computes the pulse period from the beat frequency', () => {
    expect(pulsePeriod(10)).toBeCloseTo(0.1)
  })
  it('guards against a zero beat frequency', () => {
    expect(Number.isFinite(pulsePeriod(0))).toBe(true)
  })
  it('scales on-duration by the duty cycle', () => {
    expect(pulseOnDuration(10, 0.5)).toBeCloseTo(0.05)
  })
})

describe('lerp', () => {
  it('interpolates linearly', () => {
    expect(lerp(0, 10, 0.5)).toBe(5)
  })
  it('clamps progress outside 0..1', () => {
    expect(lerp(0, 10, -1)).toBe(0)
    expect(lerp(0, 10, 2)).toBe(10)
  })
})

describe('rampedBeatAt', () => {
  it('holds the start value at t=0', () => {
    expect(rampedBeatAt(10, 6, 600, 0)).toBe(10)
  })
  it('reaches the midpoint halfway through', () => {
    expect(rampedBeatAt(10, 6, 600, 300)).toBe(8)
  })
  it('holds the target after completion', () => {
    expect(rampedBeatAt(10, 6, 600, 900)).toBe(6)
  })
  it('returns the target immediately for a zero-length ramp', () => {
    expect(rampedBeatAt(10, 6, 0, 0)).toBe(6)
  })
})
