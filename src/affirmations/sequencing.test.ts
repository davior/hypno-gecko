import { describe, expect, it } from 'vitest'
import { buildPlaylist, shuffle } from './sequencing'
import {
  DEFAULT_DELIVERY,
  type Affirmation,
  type DeliveryConfig,
} from './types'

const A: Affirmation[] = [
  { id: 'a', text: 'a', weight: 1 },
  { id: 'b', text: 'b', weight: 2 },
  { id: 'c', text: 'c', weight: 1 },
]

function cfg(patch: Partial<DeliveryConfig> = {}): DeliveryConfig {
  return { ...DEFAULT_DELIVERY, ...patch }
}

describe('shuffle', () => {
  it('preserves the multiset of elements', () => {
    const out = shuffle([1, 2, 3, 4], () => 0)
    expect([...out].sort()).toEqual([1, 2, 3, 4])
  })
})

describe('buildPlaylist', () => {
  it('linear repeats the set in order', () => {
    const out = buildPlaylist(A, cfg({ sequencing: 'linear', repetitions: 2 }))
    expect(out.map((a) => a.id)).toEqual(['a', 'b', 'c', 'a', 'b', 'c'])
  })

  it('shuffle keeps each affirmation exactly reps times', () => {
    const out = buildPlaylist(
      A,
      cfg({ sequencing: 'shuffle', repetitions: 3 }),
      () => 0,
    )
    expect(out).toHaveLength(9)
    expect(out.filter((a) => a.id === 'a')).toHaveLength(3)
  })

  it('weighted repeats proportionally to weight × reps', () => {
    const out = buildPlaylist(
      A,
      cfg({ sequencing: 'weighted', repetitions: 2 }),
      () => 0,
    )
    expect(out).toHaveLength(8) // a:2, b:4, c:2
    expect(out.filter((a) => a.id === 'b')).toHaveLength(4)
  })

  it('drops blank affirmations and empties to nothing', () => {
    expect(buildPlaylist([{ id: 'x', text: '   ', weight: 1 }], cfg())).toEqual([])
  })
})
