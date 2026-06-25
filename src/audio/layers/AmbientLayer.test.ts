import { describe, expect, it } from 'vitest'
import { createMockAudioContext } from '../../test/mockAudioContext'
import { DEFAULT_AMBIENT, type AmbientConfig } from '../types'
import { AmbientLayer } from './AmbientLayer'

function amb(patch: Partial<AmbientConfig> = {}): AmbientConfig {
  return { ...DEFAULT_AMBIENT, ...patch }
}

describe('AmbientLayer', () => {
  it('wires a looping noise source through a low-pass tone filter', () => {
    const c = createMockAudioContext()
    const layer = new AmbientLayer(
      c as unknown as BaseAudioContext,
      amb({ type: 'pink', volume: 0.6, toneHz: 8000 }),
    )

    expect(c.bufferSources).toHaveLength(1)
    expect(c.bufferSources[0].loop).toBe(true)
    expect(c.bufferSources[0].buffer).not.toBeNull()
    expect(c.filters[0].type).toBe('lowpass')
    expect(c.filters[0].frequency.value).toBe(8000)
    expect(layer.output.gain.value).toBeCloseTo(0.6)
    expect(layer.type).toBe('pink')
  })

  it('starts and stops the source idempotently', () => {
    const c = createMockAudioContext()
    const layer = new AmbientLayer(c as unknown as BaseAudioContext, amb())
    layer.start()
    layer.start()
    expect(c.bufferSources[0].started).toBe(true)
    layer.stop()
    layer.stop()
    expect(c.bufferSources[0].stopped).toBe(true)
    layer.dispose()
  })

  it('updates volume and tone in place', () => {
    const c = createMockAudioContext()
    const layer = new AmbientLayer(
      c as unknown as BaseAudioContext,
      amb({ volume: 0.3, toneHz: 5000 }),
    )
    layer.update(amb({ volume: 0.9, toneHz: 15000 }))
    expect(layer.output.gain.value).toBeCloseTo(0.9)
    expect(c.filters[0].frequency.value).toBe(15000)
  })
})
