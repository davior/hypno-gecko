import type { BeatMethod, BeatMethodInfo } from '../audio/types'

/** The four entrainment methods (Module 3). */
export const BEAT_METHODS: BeatMethodInfo[] = [
  {
    id: 'binaural',
    name: 'Binaural',
    tagline: 'Neurological · headphones',
    description:
      'A different tone in each ear; the brain perceives the difference as a beat. Subtlest method — works below conscious perception. Requires headphones.',
    requiresHeadphones: true,
  },
  {
    id: 'monaural',
    name: 'Monaural',
    tagline: 'Acoustically real',
    description:
      'Two tones mixed before they reach you, so the beat is physically present in the sound. Often considered more powerful than binaural. No headphones needed.',
    requiresHeadphones: false,
  },
  {
    id: 'am',
    name: 'AM',
    tagline: 'Amplitude modulation',
    description:
      'A single carrier whose volume wavers at the beat frequency, creating a pulsing, breathing tone. No headphones needed.',
    requiresHeadphones: false,
  },
  {
    id: 'isochronic',
    name: 'Isochronic',
    tagline: 'Sharpest · most rapid',
    description:
      'A single tone switched cleanly on and off at the beat frequency. The most distinct entrainment signal and widely held to be the most effective. No headphones needed.',
    requiresHeadphones: false,
  },
]

export function methodInfo(id: BeatMethod): BeatMethodInfo {
  // Non-null: BEAT_METHODS covers every BeatMethod by construction.
  return BEAT_METHODS.find((m) => m.id === id)!
}
