/**
 * Affirmation Engine (Module 1) + Text-to-Speech delivery (Module 2).
 *
 * Phase 3 covers Path A (direct entry): manual affirmation libraries with
 * tags and import, spoken via the browser's Web Speech API with delivery
 * controls. AI generation, voice cloning, and prosody shaping come later.
 */

export interface Affirmation {
  id: string
  text: string
  /** Relative emphasis for weighted sequencing (1–5). */
  weight: number
}

export interface AffirmationSet {
  id: string
  name: string
  tags: string[]
  affirmations: Affirmation[]
  createdAt: number
  updatedAt: number
}

export type Sequencing = 'linear' | 'shuffle' | 'weighted'

export interface DeliveryConfig {
  /** How many times each affirmation plays per session. */
  repetitions: number
  sequencing: Sequencing
  /** Silence between statements, in seconds. */
  gapSec: number
  /** Speech rate (0.5 slow & hypnotic … 1.5 brisk). */
  rate: number
  /** Speech pitch (0–2). */
  pitch: number
  /** Speech volume (0–1). */
  volume: number
  /** Selected Web Speech voice URI, or null for the system default. */
  voiceURI: string | null
}

export const DEFAULT_DELIVERY: DeliveryConfig = {
  repetitions: 3,
  sequencing: 'shuffle',
  gapSec: 4,
  rate: 0.85,
  pitch: 1,
  volume: 1,
  voiceURI: null,
}

export const DELIVERY_LIMITS = {
  repetitions: { min: 1, max: 20 },
  gapSec: { min: 0, max: 30 },
  rate: { min: 0.5, max: 1.5 },
  pitch: { min: 0, max: 2 },
  volume: { min: 0, max: 1 },
  weight: { min: 1, max: 5 },
} as const

export const SEQUENCING_INFO: Record<Sequencing, { label: string; hint: string }> = {
  linear: { label: 'Linear', hint: 'Plays the set in order, each pass identical.' },
  shuffle: { label: 'Shuffle', hint: 'Each pass is freshly randomised.' },
  weighted: {
    label: 'Weighted',
    hint: 'Higher-weight affirmations repeat more often.',
  },
}
