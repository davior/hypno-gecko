import { LIMITS } from '../audio/types'

/**
 * Frequency Library (Module 4B).
 *
 * A curated, browsable reference drawn from several traditions and disciplines.
 * Every entry carries an honest evidence tier — the library educates and lets
 * frequencies load into the generator; it makes no medical claims.
 */

export type EvidenceTier =
  | 'physics'
  | 'neuroscience'
  | 'tradition'
  | 'alternative'
  | 'research'

export interface EvidenceTierInfo {
  label: string
  short: string
  hex: string
}

export const EVIDENCE_TIERS: Record<EvidenceTier, EvidenceTierInfo> = {
  physics: { label: 'Physics', short: 'Physics', hex: '#6fd6e6' },
  neuroscience: { label: 'Neuroscience', short: 'Neuro', hex: '#9b8cf0' },
  tradition: {
    label: 'Sound Healing Tradition',
    short: 'Tradition',
    hex: '#f6a657',
  },
  alternative: {
    label: 'Alternative / Unverified',
    short: 'Unverified',
    hex: '#e8748c',
  },
  research: { label: 'Active Research', short: 'Research', hex: '#7fe0b8' },
}

export type LibraryCategory =
  | 'solfeggio'
  | 'cymatic'
  | 'brainwave'
  | 'schumann'
  | 'matter'
  | 'rife'

export interface CategoryInfo {
  id: LibraryCategory
  name: string
  icon: string
  tagline: string
  theory: string
  caution?: string
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'solfeggio',
    name: 'Solfeggio',
    icon: '🎵',
    tagline: 'An ancient tonal system linked to harmony and renewal.',
    theory:
      'Associated with Gregorian chant and attributed to Guido d’Arezzo, then rediscovered by Dr. Joseph Puleo in the 1970s via numerological patterns in sacred texts. Each tone reduces numerologically to 3, 6, or 9.',
    caution:
      'Scientific evidence for specific healing claims is limited. Used as a complementary tool, not a medical treatment.',
  },
  {
    id: 'cymatic',
    name: 'Cymatic',
    icon: '🌊',
    tagline: 'Frequencies at which sound becomes visible geometry.',
    theory:
      'Cymatics — coined by Hans Jenny in the 1960s, building on Ernst Chladni — studies how frequencies form repeatable geometric patterns in sand, water, and metal. The extension to biological tissue is theoretical.',
    caution:
      'Cymatics is legitimate acoustic physics; its application to biological healing is not yet clinically validated.',
  },
  {
    id: 'brainwave',
    name: 'Brainwave',
    icon: '🧠',
    tagline: 'The electrical language of consciousness.',
    theory:
      'The brain oscillates across frequency bands that correlate with states of consciousness and arousal. Entrainment — guiding the brain toward a target with rhythmic stimuli — is the core mechanism of this app, and the most scientifically grounded category here.',
  },
  {
    id: 'schumann',
    name: 'Schumann',
    icon: '🌍',
    tagline: 'The electromagnetic heartbeat of the Earth.',
    theory:
      'Standing electromagnetic waves in the cavity between Earth’s surface and the ionosphere, driven by global lightning. Documented by Winfried Otto Schumann in 1952; the 7.83 Hz fundamental sits on the alpha/theta border.',
    caution:
      'The physics is well established. Specific biological effects on humans are an active, not-yet-conclusive research area.',
  },
  {
    id: 'matter',
    name: 'Resonance of Matter',
    icon: '⚗️',
    tagline: 'Every structure has a natural resonant frequency.',
    theory:
      'Resonance is foundational physics: structures vibrate most efficiently at their natural frequency, from wine glasses to molecules. Sound-healing traditions extend this to organs and cells (“sympathetic resonance”).',
    caution:
      'Physical resonance is real science; matching organ frequencies via audio for therapy is speculative for most entries. Tiers are labelled per entry.',
  },
  {
    id: 'rife',
    name: 'Rife',
    icon: '🔬',
    tagline: 'Claimed resonant signatures of microorganisms.',
    theory:
      'Royal Raymond Rife (1888–1971) proposed each microbe has a Mortal Oscillatory Rate (MOR) at which it could be disrupted. His claims were rejected by the AMA and never independently replicated; most circulating lists postdate his work.',
    caution:
      'Included for research and exploration only. There is no reliable evidence that audio-range Rife frequencies treat, cure, or prevent any disease. Consult a healthcare professional for medical concerns.',
  },
]

export function categoryInfo(id: LibraryCategory): CategoryInfo {
  return CATEGORIES.find((c) => c.id === id)!
}

export interface FrequencyEntry {
  id: string
  hz: number
  name: string
  category: LibraryCategory
  association: string
  tier: EvidenceTier
  keywords?: string[]
}

export const LIBRARY: FrequencyEntry[] = [
  // --- Solfeggio ---
  { id: 'sol-174', hz: 174, name: '174 Hz', category: 'solfeggio', tier: 'tradition', association: 'Foundation — grounding and physical tension relief.', keywords: ['pain', 'grounding'] },
  { id: 'sol-285', hz: 285, name: '285 Hz', category: 'solfeggio', tier: 'tradition', association: 'Cellular repair — tissue restoration and regeneration.', keywords: ['immunity', 'healing'] },
  { id: 'sol-396', hz: 396, name: '396 Hz · UT', category: 'solfeggio', tier: 'tradition', association: 'Liberation from guilt and fear; emotional stability.', keywords: ['fear', 'release'] },
  { id: 'sol-417', hz: 417, name: '417 Hz · RE', category: 'solfeggio', tier: 'tradition', association: 'Undoing situations and facilitating change.', keywords: ['change'] },
  { id: 'sol-528', hz: 528, name: '528 Hz · MI', category: 'solfeggio', tier: 'alternative', association: 'The "miracle"/love frequency; transformation, DNA-repair associations.', keywords: ['love', 'dna', 'transformation'] },
  { id: 'sol-639', hz: 639, name: '639 Hz · FA', category: 'solfeggio', tier: 'tradition', association: 'Connection, relationships, communication, harmony.', keywords: ['relationships'] },
  { id: 'sol-741', hz: 741, name: '741 Hz · SOL', category: 'solfeggio', tier: 'tradition', association: 'Awakening intuition, problem-solving, detoxification.', keywords: ['intuition', 'detox'] },
  { id: 'sol-852', hz: 852, name: '852 Hz · LA', category: 'solfeggio', tier: 'tradition', association: 'Returning to spiritual order, higher consciousness.', keywords: ['spiritual'] },
  { id: 'sol-963', hz: 963, name: '963 Hz · SI', category: 'solfeggio', tier: 'tradition', association: '"God consciousness"; pineal activation, cosmic unity.', keywords: ['pineal', 'unity'] },
  { id: 'sol-1074', hz: 1074, name: '1074 Hz', category: 'solfeggio', tier: 'tradition', association: 'Extended tone — deep meditation, expanded states.', keywords: ['meditation'] },

  // --- Cymatic ---
  { id: 'cym-432', hz: 432, name: '432 Hz', category: 'cymatic', tier: 'tradition', association: 'Natural tuning — harmonising and soothing; claimed alignment with natural body frequencies.', keywords: ['tuning', 'natural'] },
  { id: 'cym-111', hz: 111, name: '111 Hz', category: 'cymatic', tier: 'tradition', association: 'Reported shift into a meditative, right-brain-dominant state.', keywords: ['meditation'] },
  { id: 'cym-147', hz: 147, name: '147 Hz', category: 'cymatic', tier: 'tradition', association: 'Associated with feelings of love and emotional resonance.', keywords: ['love'] },
  { id: 'cym-205', hz: 205, name: '205 Hz', category: 'cymatic', tier: 'tradition', association: 'Associated with happiness and elevated mood.', keywords: ['mood', 'happiness'] },
  { id: 'cym-256', hz: 256, name: '256 Hz', category: 'cymatic', tier: 'physics', association: 'Scientific "C" — natural harmonic of middle C in just intonation.', keywords: ['music', 'middle c'] },
  { id: 'cym-512', hz: 512, name: '512 Hz', category: 'cymatic', tier: 'physics', association: 'Octave harmonic of 256 Hz.', keywords: ['octave'] },

  // --- Brainwave ---
  { id: 'bw-delta', hz: 2, name: 'Delta · 2 Hz', category: 'brainwave', tier: 'neuroscience', association: 'Deep sleep, cellular repair, unconscious processing.', keywords: ['sleep', 'delta'] },
  { id: 'bw-theta', hz: 6, name: 'Theta · 6 Hz', category: 'brainwave', tier: 'neuroscience', association: 'Deep hypnosis, creativity, memory access, REM border.', keywords: ['hypnosis', 'theta', 'creativity'] },
  { id: 'bw-alpha', hz: 10, name: 'Alpha · 10 Hz', category: 'brainwave', tier: 'neuroscience', association: 'Relaxed awareness, light trance, receptivity.', keywords: ['relax', 'alpha'] },
  { id: 'bw-beta', hz: 20, name: 'Beta · 20 Hz', category: 'brainwave', tier: 'neuroscience', association: 'Active thinking, focus, alertness.', keywords: ['focus', 'beta'] },
  { id: 'bw-gamma', hz: 40, name: 'Gamma · 40 Hz', category: 'brainwave', tier: 'neuroscience', association: 'Peak cognition, insight, perceptual binding.', keywords: ['gamma', 'insight'] },
  { id: 'bw-epsilon', hz: 0.3, name: 'Epsilon · 0.3 Hz', category: 'brainwave', tier: 'research', association: 'Extreme stillness; reported shamanic states.', keywords: ['epsilon'] },

  // --- Schumann ---
  { id: 'sch-783', hz: 7.83, name: '7.83 Hz', category: 'schumann', tier: 'physics', association: 'Fundamental — Earth’s base resonance; alpha/theta border.', keywords: ['earth', 'fundamental', 'schumann'] },
  { id: 'sch-143', hz: 14.3, name: '14.3 Hz', category: 'schumann', tier: 'research', association: '2nd harmonic — low beta; alert relaxation.', keywords: ['harmonic'] },
  { id: 'sch-208', hz: 20.8, name: '20.8 Hz', category: 'schumann', tier: 'research', association: '3rd harmonic — mid beta; focused awareness.', keywords: ['harmonic'] },
  { id: 'sch-273', hz: 27.3, name: '27.3 Hz', category: 'schumann', tier: 'research', association: '4th harmonic — high beta.', keywords: ['harmonic'] },
  { id: 'sch-338', hz: 33.8, name: '33.8 Hz', category: 'schumann', tier: 'research', association: '5th harmonic — gamma border.', keywords: ['harmonic'] },

  // --- Resonance of Matter ---
  { id: 'mat-heart', hz: 1, name: 'Human heart', category: 'matter', tier: 'physics', association: '~1 Hz resting rhythm (physiology).', keywords: ['heart', 'pulse'] },
  { id: 'mat-brain', hz: 10, name: 'Brain (alpha peak)', category: 'matter', tier: 'neuroscience', association: '~10 Hz dominant alpha rhythm.', keywords: ['brain', 'alpha'] },
  { id: 'mat-dna', hz: 528, name: 'DNA / cellular', category: 'matter', tier: 'alternative', association: '~528 Hz proposed cellular resonance (Solfeggio overlap).', keywords: ['dna', 'cell'] },
  { id: 'mat-bone', hz: 40, name: 'Bone / skeletal', category: 'matter', tier: 'research', association: '30–50 Hz — vibration therapy research.', keywords: ['bone', 'vibration'] },
  { id: 'mat-liver', hz: 317, name: 'Liver (proposed)', category: 'matter', tier: 'tradition', association: '~317 Hz in sound-healing tradition.', keywords: ['liver', 'organ'] },
  { id: 'mat-kidney', hz: 281, name: 'Kidneys (proposed)', category: 'matter', tier: 'tradition', association: '~281 Hz in sound-healing tradition.', keywords: ['kidney', 'organ'] },
  { id: 'mat-spine', hz: 52, name: 'Spine / vertebrae', category: 'matter', tier: 'research', association: '~52 Hz — biomedical / chiropractic research.', keywords: ['spine'] },
  { id: 'mat-water', hz: 25e12, name: 'Water molecule', category: 'matter', tier: 'physics', association: '~25 THz infrared resonance (far above audio range).', keywords: ['water', 'molecule'] },
  { id: 'mat-hydrogen', hz: 1.42e9, name: 'Hydrogen line', category: 'matter', tier: 'physics', association: '1420 MHz electron transition (astrophysics).', keywords: ['hydrogen', 'astronomy'] },

  // --- Rife (clearly labelled, exploration only) ---
  { id: 'rife-20', hz: 20, name: '20 Hz', category: 'rife', tier: 'alternative', association: 'General devitalisation / broad spectrum (commonly cited).', keywords: ['broad'] },
  { id: 'rife-728', hz: 728, name: '728 Hz', category: 'rife', tier: 'alternative', association: 'Candida / fungal (commonly cited).', keywords: ['candida', 'fungal'] },
  { id: 'rife-784', hz: 784, name: '784 Hz', category: 'rife', tier: 'alternative', association: 'Staphylococcus (commonly cited).', keywords: ['staph'] },
  { id: 'rife-880', hz: 880, name: '880 Hz', category: 'rife', tier: 'alternative', association: 'Candida / antifungal (commonly cited).', keywords: ['candida'] },
  { id: 'rife-10000', hz: 10000, name: '10000 Hz', category: 'rife', tier: 'alternative', association: 'General immune support (commonly cited).', keywords: ['immune'] },
]

// --- Helpers ----------------------------------------------------------------

/** Human-readable frequency, scaling into kHz/MHz/GHz/THz as needed. */
export function formatHz(hz: number): string {
  const abs = Math.abs(hz)
  if (abs >= 1e12) return `${(hz / 1e12).toPrecision(3)} THz`
  if (abs >= 1e9) return `${(hz / 1e9).toPrecision(3)} GHz`
  if (abs >= 1e6) return `${(hz / 1e6).toPrecision(3)} MHz`
  if (abs >= 1e4) return `${(hz / 1e3).toPrecision(3)} kHz`
  if (abs > 0 && abs < 0.01) return `${hz.toExponential(2)} Hz`
  return `${Number.isInteger(hz) ? hz : hz.toFixed(2)} Hz`
}

/** Which generator slots a frequency can be loaded into. */
export function loadTargets(hz: number): { carrier: boolean; beat: boolean } {
  return {
    carrier: hz >= LIMITS.carrierHz.min && hz <= LIMITS.carrierHz.max,
    beat: hz >= LIMITS.beatHz.min && hz <= LIMITS.beatHz.max,
  }
}

/** Other entries that share the same frequency (cross-system references). */
export function crossRefsFor(
  entry: FrequencyEntry,
  all: FrequencyEntry[] = LIBRARY,
): FrequencyEntry[] {
  return all.filter(
    (e) => e.id !== entry.id && Math.abs(e.hz - entry.hz) < 0.01,
  )
}

export type CategoryFilter = LibraryCategory | 'all' | 'bookmarked'

export interface LibraryQuery {
  text: string
  category: CategoryFilter
  bookmarks: string[]
}

/**
 * Filter + rank the library. Numeric queries do a nearest-Hz search; text
 * queries match name, association, category, and keywords.
 */
export function searchLibrary(
  entries: FrequencyEntry[],
  query: LibraryQuery,
): FrequencyEntry[] {
  let result = entries

  if (query.category === 'bookmarked') {
    const set = new Set(query.bookmarks)
    result = result.filter((e) => set.has(e.id))
  } else if (query.category !== 'all') {
    result = result.filter((e) => e.category === query.category)
  }

  const q = query.text.trim().toLowerCase()
  if (!q) return result

  if (/^[\d.]+$/.test(q) && !Number.isNaN(Number.parseFloat(q))) {
    const target = Number.parseFloat(q)
    return [...result].sort(
      (a, b) => Math.abs(a.hz - target) - Math.abs(b.hz - target),
    )
  }

  return result.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.association.toLowerCase().includes(q) ||
      e.category.includes(q) ||
      (e.keywords ?? []).some((k) => k.toLowerCase().includes(q)),
  )
}
