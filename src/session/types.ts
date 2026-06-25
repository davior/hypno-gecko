import {
  DEFAULT_AMBIENT,
  DEFAULT_CONFIG,
  type AmbientConfig,
  type GeneratorConfig,
} from '../audio/types'

/**
 * Session Builder (Module 5) + Induction/Emergence (Modules 6/7).
 *
 * A session strings the existing engines together over time:
 *   induction (settle in) → main (beats + ambient + affirmations) → emergence.
 * It reuses GeneratorConfig and AmbientConfig wholesale; affirmation delivery
 * and the TTS engine/key are read from the affirmation store at play time and
 * never embedded here (so exported JSON carries no secrets).
 */

export type InductionType = 'none' | 'tonal' | 'countdown' | 'breathing' | 'pmr'
export type EmergenceType = 'none' | 'countup'

export interface InductionConfig {
  type: InductionType
  durationSec: number
}

export interface EmergenceConfig {
  type: EmergenceType
  durationSec: number
}

export interface SessionMain {
  durationSec: number
  beat: GeneratorConfig
  ambient: AmbientConfig
  affirmationSetId: string | null
}

export interface SessionConfig {
  id: string
  name: string
  induction: InductionConfig
  main: SessionMain
  emergence: EmergenceConfig
}

export const DEFAULT_SESSION: SessionConfig = {
  id: 'default',
  name: 'New session',
  induction: { type: 'tonal', durationSec: 300 },
  main: {
    durationSec: 1500,
    beat: {
      ...DEFAULT_CONFIG,
      method: 'isochronic',
      beatHz: 10,
      ramp: { enabled: true, targetBeatHz: 6, durationSec: 1500 },
    },
    ambient: { ...DEFAULT_AMBIENT, enabled: true, type: 'brown', volume: 0.32 },
    affirmationSetId: null,
  },
  emergence: { type: 'countup', durationSec: 120 },
}

export const SESSION_LIMITS = {
  inductionSec: { min: 0, max: 1200 },
  mainSec: { min: 60, max: 7200 },
  emergenceSec: { min: 0, max: 600 },
} as const

/** Hard cap on offline WAV render length (keeps rendering fast). */
export const MAX_EXPORT_SEC = 600

export const INDUCTION_INFO: Record<
  InductionType,
  { label: string; blurb: string; spoken: boolean }
> = {
  none: { label: 'None', blurb: 'Begin straight into the main session.', spoken: false },
  tonal: {
    label: 'Tonal',
    blurb: 'A slow beat sweep down from beta into the target state.',
    spoken: false,
  },
  countdown: {
    label: 'Countdown',
    blurb: 'A spoken deepening countdown from 10 down to 1.',
    spoken: true,
  },
  breathing: {
    label: 'Breathing',
    blurb: 'A paced breathing guide with a visual pacer.',
    spoken: true,
  },
  pmr: {
    label: 'PMR',
    blurb: 'Progressive muscle relaxation — a spoken body scan.',
    spoken: true,
  },
}

export const EMERGENCE_INFO: Record<
  EmergenceType,
  { label: string; blurb: string }
> = {
  none: { label: 'None', blurb: 'End without a structured return.' },
  countup: {
    label: 'Count-up',
    blurb: 'A spoken 1→5 return with the beat rising back toward alpha.',
  },
}
