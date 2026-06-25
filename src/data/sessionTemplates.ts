import {
  DEFAULT_AMBIENT,
  DEFAULT_CONFIG,
  type AmbientConfig,
  type BeatMethod,
  type GeneratorConfig,
  type NoiseType,
} from '../audio/types'
import type {
  EmergenceType,
  InductionType,
  SessionConfig,
} from '../session/types'

interface TemplateSpec {
  id: string
  name: string
  blurb: string
  method: BeatMethod
  startBeat: number
  /** null = hold (no ramp). */
  endBeat: number | null
  carrierHz: number
  mainMin: number
  induction: { type: InductionType; min: number }
  emergence: { type: EmergenceType; min: number }
  ambient: { type: NoiseType; volume: number } | null
}

function makeBeat(
  method: BeatMethod,
  startBeat: number,
  endBeat: number | null,
  carrierHz: number,
): GeneratorConfig {
  return {
    ...DEFAULT_CONFIG,
    method,
    carrierHz,
    beatHz: startBeat,
    ramp:
      endBeat != null
        ? { enabled: true, targetBeatHz: endBeat, durationSec: 0 }
        : { enabled: false, targetBeatHz: startBeat, durationSec: 0 },
  }
}

function makeAmbient(spec: TemplateSpec['ambient']): AmbientConfig {
  if (!spec) return { ...DEFAULT_AMBIENT, enabled: false }
  return { ...DEFAULT_AMBIENT, enabled: true, type: spec.type, volume: spec.volume }
}

function toSession(s: TemplateSpec): SessionConfig {
  return {
    id: s.id,
    name: s.name,
    induction: { type: s.induction.type, durationSec: s.induction.min * 60 },
    main: {
      durationSec: s.mainMin * 60,
      beat: makeBeat(s.method, s.startBeat, s.endBeat, s.carrierHz),
      ambient: makeAmbient(s.ambient),
      affirmationSetId: null,
    },
    emergence: { type: s.emergence.type, durationSec: s.emergence.min * 60 },
  }
}

const SPECS: TemplateSpec[] = [
  {
    id: 'morning-activation',
    name: 'Morning Activation',
    blurb: 'Alpha → Beta · isochronic · 15 min',
    method: 'isochronic',
    startBeat: 10,
    endBeat: 18,
    carrierHz: 210,
    mainMin: 15,
    induction: { type: 'tonal', min: 2 },
    emergence: { type: 'countup', min: 1 },
    ambient: { type: 'pink', volume: 0.22 },
  },
  {
    id: 'deep-programming',
    name: 'Deep Programming',
    blurb: 'Alpha → Theta · binaural · 45 min',
    method: 'binaural',
    startBeat: 10,
    endBeat: 6,
    carrierHz: 200,
    mainMin: 45,
    induction: { type: 'countdown', min: 5 },
    emergence: { type: 'countup', min: 3 },
    ambient: { type: 'brown', volume: 0.3 },
  },
  {
    id: 'sleep-induction',
    name: 'Sleep Induction',
    blurb: 'Theta → Delta · monaural · 60 min',
    method: 'monaural',
    startBeat: 6,
    endBeat: 2,
    carrierHz: 150,
    mainMin: 60,
    induction: { type: 'breathing', min: 5 },
    emergence: { type: 'none', min: 0 },
    ambient: { type: 'brown', volume: 0.35 },
  },
  {
    id: 'creative-flow',
    name: 'Creative Flow',
    blurb: 'Alpha · AM · 30 min',
    method: 'am',
    startBeat: 10,
    endBeat: null,
    carrierHz: 220,
    mainMin: 30,
    induction: { type: 'tonal', min: 3 },
    emergence: { type: 'countup', min: 2 },
    ambient: { type: 'pink', volume: 0.25 },
  },
  {
    id: 'trauma-release',
    name: 'Trauma Release',
    blurb: 'Theta · binaural · 40 min',
    method: 'binaural',
    startBeat: 6,
    endBeat: null,
    carrierHz: 200,
    mainMin: 40,
    induction: { type: 'pmr', min: 5 },
    emergence: { type: 'countup', min: 3 },
    ambient: { type: 'brown', volume: 0.3 },
  },
  {
    id: 'focus-block',
    name: 'Focus Block',
    blurb: 'Beta · isochronic · 25 min',
    method: 'isochronic',
    startBeat: 18,
    endBeat: null,
    carrierHz: 240,
    mainMin: 25,
    induction: { type: 'countdown', min: 2 },
    emergence: { type: 'countup', min: 1 },
    ambient: { type: 'pink', volume: 0.2 },
  },
]

export interface SessionTemplate {
  id: string
  name: string
  blurb: string
  session: SessionConfig
}

export const SESSION_TEMPLATES: SessionTemplate[] = SPECS.map((s) => ({
  id: s.id,
  name: s.name,
  blurb: s.blurb,
  session: toSession(s),
}))
