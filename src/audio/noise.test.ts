import { describe, expect, it } from 'vitest'
import { generateNoiseData } from './noise'
import type { NoiseType } from './types'

const TYPES: NoiseType[] = ['white', 'pink', 'brown']

describe('generateNoiseData', () => {
  it.each(TYPES)('produces bounded, non-trivial %s noise', (type) => {
    const data = generateNoiseData(type, 8192)
    expect(data).toHaveLength(8192)

    let peak = 0
    let sumSquares = 0
    for (const v of data) {
      expect(Number.isFinite(v)).toBe(true)
      peak = Math.max(peak, Math.abs(v))
      sumSquares += v * v
    }
    const rms = Math.sqrt(sumSquares / data.length)

    expect(peak).toBeLessThanOrEqual(1) // never clips
    expect(peak).toBeGreaterThan(0) // not silent
    expect(rms).toBeGreaterThan(0.001) // carries real energy
  })

  it('returns an empty array for zero length', () => {
    expect(generateNoiseData('white', 0)).toHaveLength(0)
  })
})
