import { describe, expect, it } from 'vitest'
import {
  affirmationFireTimes,
  affirmationSlots,
  buildTimeline,
  emergenceBeat,
  inductionBeat,
  mainBeat,
} from './schedule'
import { DEFAULT_SESSION, type SessionConfig } from './types'

function sess(patch: Partial<SessionConfig> = {}): SessionConfig {
  return { ...DEFAULT_SESSION, ...patch }
}

describe('buildTimeline', () => {
  it('orders induction, main, emergence with absolute starts', () => {
    const s = sess({
      induction: { type: 'tonal', durationSec: 300 },
      main: { ...DEFAULT_SESSION.main, durationSec: 1500 },
      emergence: { type: 'countup', durationSec: 120 },
    })
    const { phases, totalSec } = buildTimeline(s)
    expect(phases.map((p) => p.kind)).toEqual(['induction', 'main', 'emergence'])
    expect(phases.map((p) => p.startSec)).toEqual([0, 300, 1800])
    expect(totalSec).toBe(1920)
  })

  it('omits induction and emergence when set to none', () => {
    const s = sess({
      induction: { type: 'none', durationSec: 0 },
      emergence: { type: 'none', durationSec: 0 },
    })
    const { phases } = buildTimeline(s)
    expect(phases.map((p) => p.kind)).toEqual(['main'])
    expect(phases[0].startSec).toBe(0)
  })
})

describe('affirmationFireTimes', () => {
  it('spaces evenly within the phase', () => {
    expect(affirmationFireTimes(600, 3)).toEqual([150, 300, 450])
  })
  it('returns nothing for zero count', () => {
    expect(affirmationFireTimes(600, 0)).toEqual([])
  })
})

describe('affirmationSlots', () => {
  it('guarantees at least one full pass and caps the total', () => {
    expect(affirmationSlots(60, 4)).toBe(4)
    expect(affirmationSlots(3600, 4)).toBe(40)
    expect(affirmationSlots(600, 0)).toBe(0)
  })
})

describe('derived beats', () => {
  it('induction sweeps from 15 Hz down to the main beat', () => {
    const s = sess()
    const b = inductionBeat(s)
    expect(b.beatHz).toBe(15)
    expect(b.ramp.enabled).toBe(true)
    expect(b.ramp.targetBeatHz).toBe(s.main.beat.beatHz)
    expect(b.ramp.durationSec).toBe(s.induction.durationSec)
  })

  it('stretches the main ramp across the main duration', () => {
    const s = sess()
    expect(mainBeat(s).ramp.durationSec).toBe(s.main.durationSec)
  })

  it('emergence rises from the main end frequency toward 12 Hz', () => {
    const s = sess() // default main ramp 10 -> 6
    const b = emergenceBeat(s)
    expect(b.beatHz).toBe(6)
    expect(b.ramp.targetBeatHz).toBe(12)
    expect(b.ramp.durationSec).toBe(s.emergence.durationSec)
  })
})
