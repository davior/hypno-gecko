/**
 * Brainwave State Selector data (Module 3).
 *
 * Ranges and qualities are taken directly from the specification. The five
 * bands below are the ones practical to target with audio entrainment; the
 * exotic Epsilon (<0.5 Hz) and Lambda/Hypergamma (>100 Hz) bands live in the
 * Frequency Library (Module 4B, a later phase) rather than the beat selector.
 */

export type AccentColor = 'ember' | 'rose' | 'violet' | 'cyan' | 'mint'

export interface BrainwaveBand {
  id: string
  name: string
  range: [number, number]
  /** A sensible default beat frequency within the band. */
  defaultBeat: number
  qualities: string
  accent: AccentColor
}

export const BRAINWAVE_BANDS: BrainwaveBand[] = [
  {
    id: 'delta',
    name: 'Delta',
    range: [0.5, 4],
    defaultBeat: 2,
    qualities: 'Deep sleep, cellular repair, unconscious processing',
    accent: 'ember',
  },
  {
    id: 'theta',
    name: 'Theta',
    range: [4, 8],
    defaultBeat: 6,
    qualities: 'Deep hypnosis, creativity, memory access, REM border',
    accent: 'rose',
  },
  {
    id: 'alpha',
    name: 'Alpha',
    range: [8, 13],
    defaultBeat: 10,
    qualities: 'Relaxed awareness, light trance, receptivity',
    accent: 'violet',
  },
  {
    id: 'beta',
    name: 'Beta',
    range: [13, 40],
    defaultBeat: 18,
    qualities: 'Active thinking, focus, alertness',
    accent: 'cyan',
  },
  {
    id: 'gamma',
    name: 'Gamma',
    range: [40, 50],
    defaultBeat: 40,
    qualities: 'Peak cognition, insight, perceptual binding',
    accent: 'mint',
  },
]

/** Find the band that contains a given beat frequency. */
export function bandForBeat(beatHz: number): BrainwaveBand | undefined {
  return BRAINWAVE_BANDS.find(
    (b) => beatHz >= b.range[0] && beatHz < b.range[1],
  )
}

export const ACCENT_HEX: Record<AccentColor, string> = {
  ember: '#f6a657',
  rose: '#e8748c',
  violet: '#9b8cf0',
  cyan: '#6fd6e6',
  mint: '#7fe0b8',
}
