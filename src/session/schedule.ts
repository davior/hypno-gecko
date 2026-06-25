import type { GeneratorConfig } from '../audio/types'
import type { SessionConfig } from './types'

export type PhaseKind = 'induction' | 'main' | 'emergence'

export interface Phase {
  kind: PhaseKind
  label: string
  startSec: number
  durationSec: number
}

export interface Timeline {
  phases: Phase[]
  totalSec: number
}

/** Ordered phases with absolute start times, skipping disabled/zero phases. */
export function buildTimeline(session: SessionConfig): Timeline {
  const phases: Phase[] = []
  let t = 0

  if (session.induction.type !== 'none' && session.induction.durationSec > 0) {
    phases.push({
      kind: 'induction',
      label: 'Induction',
      startSec: t,
      durationSec: session.induction.durationSec,
    })
    t += session.induction.durationSec
  }

  phases.push({
    kind: 'main',
    label: 'Main',
    startSec: t,
    durationSec: session.main.durationSec,
  })
  t += session.main.durationSec

  if (session.emergence.type !== 'none' && session.emergence.durationSec > 0) {
    phases.push({
      kind: 'emergence',
      label: 'Emergence',
      startSec: t,
      durationSec: session.emergence.durationSec,
    })
    t += session.emergence.durationSec
  }

  return { phases, totalSec: t }
}

/** Evenly-spaced fire offsets (seconds, within the main phase) for `count` items. */
export function affirmationFireTimes(mainDurationSec: number, count: number): number[] {
  if (count <= 0 || mainDurationSec <= 0) return []
  const step = mainDurationSec / (count + 1)
  const times: number[] = []
  for (let i = 1; i <= count; i++) times.push(Math.round(step * i))
  return times
}

/**
 * How many affirmation utterances to schedule across the main phase — roughly
 * one every ~45s, but always at least one full pass through the set, capped.
 */
export function affirmationSlots(mainDurationSec: number, setSize: number): number {
  if (setSize <= 0) return 0
  const byTime = Math.round(mainDurationSec / 45)
  return Math.max(setSize, Math.min(byTime, 40))
}

const INDUCTION_START_HZ = 15
const EMERGENCE_END_HZ = 12

/** Induction beat: a downward sweep from beta into the main beat. */
export function inductionBeat(session: SessionConfig): GeneratorConfig {
  return {
    ...session.main.beat,
    beatHz: INDUCTION_START_HZ,
    ramp: {
      enabled: true,
      targetBeatHz: session.main.beat.beatHz,
      durationSec: session.induction.durationSec,
    },
  }
}

/** Main beat with its ramp (if any) stretched to span the whole main phase. */
export function mainBeat(session: SessionConfig): GeneratorConfig {
  const beat = session.main.beat
  if (!beat.ramp.enabled) return beat
  return { ...beat, ramp: { ...beat.ramp, durationSec: session.main.durationSec } }
}

/** Emergence beat: rise from the main's end frequency back toward alpha. */
export function emergenceBeat(session: SessionConfig): GeneratorConfig {
  const endHz = session.main.beat.ramp.enabled
    ? session.main.beat.ramp.targetBeatHz
    : session.main.beat.beatHz
  return {
    ...session.main.beat,
    beatHz: endHz,
    ramp: {
      enabled: true,
      targetBeatHz: EMERGENCE_END_HZ,
      durationSec: session.emergence.durationSec,
    },
  }
}
