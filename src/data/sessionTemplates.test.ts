import { describe, expect, it } from 'vitest'
import { LIMITS } from '../audio/types'
import { buildTimeline } from '../session/schedule'
import { SESSION_TEMPLATES } from './sessionTemplates'

const METHODS = new Set(['binaural', 'monaural', 'am', 'isochronic'])

describe('session templates', () => {
  it('provides the six spec templates, all well-formed', () => {
    expect(SESSION_TEMPLATES).toHaveLength(6)

    for (const t of SESSION_TEMPLATES) {
      const main = t.session.main
      expect(main.durationSec).toBeGreaterThan(0)
      expect(METHODS.has(main.beat.method)).toBe(true)
      expect(main.beat.beatHz).toBeGreaterThanOrEqual(LIMITS.beatHz.min)
      expect(main.beat.beatHz).toBeLessThanOrEqual(LIMITS.beatHz.max)

      const { totalSec } = buildTimeline(t.session)
      expect(totalSec).toBe(
        t.session.induction.durationSec +
          main.durationSec +
          t.session.emergence.durationSec,
      )
    }
  })

  it('has unique template ids', () => {
    const ids = new Set(SESSION_TEMPLATES.map((t) => t.id))
    expect(ids.size).toBe(SESSION_TEMPLATES.length)
  })
})
