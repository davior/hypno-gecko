/**
 * Carrier and beat presets (Module 3 — Advanced Beat Architecture).
 *
 * A fuller, browsable Frequency Library (Module 4B) arrives in a later phase;
 * these are the quick-access carriers and beat targets for the generator.
 */

export interface FrequencyPreset {
  hz: number
  name: string
  note?: string
}

/** Solfeggio carrier tones (396–963 Hz core set, plus grounding 174/285). */
export const SOLFEGGIO: FrequencyPreset[] = [
  { hz: 174, name: '174 Hz', note: 'Foundation · grounding' },
  { hz: 285, name: '285 Hz', note: 'Cellular repair' },
  { hz: 396, name: '396 Hz · UT', note: 'Liberation from fear' },
  { hz: 417, name: '417 Hz · RE', note: 'Facilitating change' },
  { hz: 528, name: '528 Hz · MI', note: 'Transformation / "miracle"' },
  { hz: 639, name: '639 Hz · FA', note: 'Connection, relationships' },
  { hz: 741, name: '741 Hz · SOL', note: 'Awakening intuition' },
  { hz: 852, name: '852 Hz · LA', note: 'Spiritual order' },
  { hz: 963, name: '963 Hz · SI', note: 'Higher consciousness' },
]

/** Schumann resonance harmonic series — used as beat (entrainment) targets. */
export const SCHUMANN: FrequencyPreset[] = [
  { hz: 7.83, name: '7.83 Hz', note: 'Fundamental · alpha/theta border' },
  { hz: 14.3, name: '14.3 Hz', note: '2nd harmonic · low beta' },
  { hz: 20.8, name: '20.8 Hz', note: '3rd harmonic · mid beta' },
  { hz: 27.3, name: '27.3 Hz', note: '4th harmonic · high beta' },
  { hz: 33.8, name: '33.8 Hz', note: '5th harmonic · gamma border' },
]

/** A couple of common reference carriers outside the Solfeggio set. */
export const REFERENCE_CARRIERS: FrequencyPreset[] = [
  { hz: 136.1, name: '136.1 Hz', note: 'OM · cosmic month' },
  { hz: 432, name: '432 Hz', note: 'Natural tuning' },
  { hz: 440, name: '440 Hz', note: 'Concert A' },
]
