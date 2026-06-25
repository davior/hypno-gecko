import { describe, expect, it } from 'vitest'
import {
  CATEGORIES,
  EVIDENCE_TIERS,
  LIBRARY,
  crossRefsFor,
  formatHz,
  loadTargets,
  searchLibrary,
} from './library'

describe('library data integrity', () => {
  it('has unique ids and valid tiers/categories', () => {
    const ids = new Set<string>()
    const cats = new Set(CATEGORIES.map((c) => c.id))
    for (const entry of LIBRARY) {
      expect(ids.has(entry.id)).toBe(false)
      ids.add(entry.id)
      expect(cats.has(entry.category)).toBe(true)
      expect(EVIDENCE_TIERS[entry.tier]).toBeDefined()
      expect(entry.hz).toBeGreaterThan(0)
    }
  })
})

describe('formatHz', () => {
  it('keeps audio-range values in Hz', () => {
    expect(formatHz(528)).toBe('528 Hz')
    expect(formatHz(7.83)).toBe('7.83 Hz')
  })
  it('scales large and tiny values', () => {
    expect(formatHz(25e12)).toContain('THz')
    expect(formatHz(1.42e9)).toContain('GHz')
    expect(formatHz(0.0000058)).toContain('e-6')
  })
})

describe('loadTargets', () => {
  it('allows a carrier for mid-range tones', () => {
    expect(loadTargets(528)).toEqual({ carrier: true, beat: false })
  })
  it('allows a beat for low frequencies', () => {
    expect(loadTargets(7.83)).toEqual({ carrier: false, beat: true })
  })
  it('rejects out-of-range frequencies', () => {
    expect(loadTargets(25e12)).toEqual({ carrier: false, beat: false })
  })
})

describe('crossRefsFor', () => {
  it('links 528 Hz across Solfeggio and Resonance of Matter', () => {
    const sol = LIBRARY.find((e) => e.id === 'sol-528')!
    const refs = crossRefsFor(sol)
    expect(refs.some((r) => r.id === 'mat-dna')).toBe(true)
  })
})

describe('searchLibrary', () => {
  it('filters by category', () => {
    const out = searchLibrary(LIBRARY, {
      text: '',
      category: 'rife',
      bookmarks: [],
    })
    expect(out.length).toBeGreaterThan(0)
    expect(out.every((e) => e.category === 'rife')).toBe(true)
  })

  it('matches keywords case-insensitively', () => {
    const out = searchLibrary(LIBRARY, {
      text: 'SLEEP',
      category: 'all',
      bookmarks: [],
    })
    expect(out.some((e) => e.id === 'bw-delta')).toBe(true)
  })

  it('ranks a numeric query by nearest Hz', () => {
    const out = searchLibrary(LIBRARY, {
      text: '530',
      category: 'all',
      bookmarks: [],
    })
    expect(out[0].hz).toBe(528)
  })

  it('returns only bookmarked entries when filtered', () => {
    const out = searchLibrary(LIBRARY, {
      text: '',
      category: 'bookmarked',
      bookmarks: ['sol-396'],
    })
    expect(out).toHaveLength(1)
    expect(out[0].id).toBe('sol-396')
  })
})
