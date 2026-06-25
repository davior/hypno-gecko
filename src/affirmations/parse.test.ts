import { describe, expect, it } from 'vitest'
import { parseAffirmations, parseCsvRow } from './parse'

describe('parseCsvRow', () => {
  it('splits simple columns', () => {
    expect(parseCsvRow('hello,3')).toEqual(['hello', '3'])
  })
  it('honours quoted commas', () => {
    expect(parseCsvRow('"I am calm, and free",2')).toEqual([
      'I am calm, and free',
      '2',
    ])
  })
  it('unescapes doubled quotes', () => {
    expect(parseCsvRow('"she said ""hi""",1')).toEqual(['she said "hi"', '1'])
  })
})

describe('parseAffirmations (txt)', () => {
  it('takes one affirmation per non-blank line at weight 1', () => {
    expect(parseAffirmations('first\n\n  second \n', 'txt')).toEqual([
      { text: 'first', weight: 1 },
      { text: 'second', weight: 1 },
    ])
  })
})

describe('parseAffirmations (csv)', () => {
  it('parses text + weight and skips a header row', () => {
    expect(
      parseAffirmations('text,weight\nI am calm,3\n"I am, free",2', 'csv'),
    ).toEqual([
      { text: 'I am calm', weight: 3 },
      { text: 'I am, free', weight: 2 },
    ])
  })
  it('defaults missing weight to 1 and clamps out-of-range', () => {
    expect(parseAffirmations('only text\nbig,99', 'csv')).toEqual([
      { text: 'only text', weight: 1 },
      { text: 'big', weight: 5 },
    ])
  })
})
