import { describe, expect, it } from 'vitest'
import { countdownLines, countupLines, PMR_LINES } from './scripts'

describe('countdownLines', () => {
  it('counts from N down to one', () => {
    const lines = countdownLines(10)
    expect(lines).toHaveLength(10)
    expect(lines[0]).toMatch(/^Ten/)
    expect(lines[9]).toMatch(/^One/)
  })
})

describe('countupLines', () => {
  it('counts up and ends fully awake', () => {
    const lines = countupLines(5)
    expect(lines).toHaveLength(5)
    expect(lines[0]).toMatch(/^One/)
    expect(lines[4]).toMatch(/awake/i)
  })
})

describe('PMR_LINES', () => {
  it('is a multi-step body scan', () => {
    expect(PMR_LINES.length).toBeGreaterThan(3)
  })
})
