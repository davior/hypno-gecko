import { DELIVERY_LIMITS } from './types'

export type ImportFormat = 'txt' | 'csv'

export interface ParsedAffirmation {
  text: string
  weight: number
}

function clampWeight(value: number): number {
  const { min, max } = DELIVERY_LIMITS.weight
  if (!Number.isFinite(value)) return 1
  return Math.min(max, Math.max(min, Math.round(value)))
}

/** Parse one CSV row, honouring double-quoted fields and "" escapes. */
export function parseCsvRow(line: string): string[] {
  const fields: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      fields.push(field)
      field = ''
    } else {
      field += ch
    }
  }
  fields.push(field)
  return fields.map((f) => f.trim())
}

/**
 * Parse imported affirmations.
 *
 *  - txt: one affirmation per non-blank line, weight 1
 *  - csv: `text[,weight]` per row; a leading `text,weight` header is ignored
 */
export function parseAffirmations(
  raw: string,
  format: ImportFormat,
): ParsedAffirmation[] {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (format === 'txt') {
    return lines.map((text) => ({ text, weight: 1 }))
  }

  const out: ParsedAffirmation[] = []
  for (let i = 0; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i])
    const text = cols[0]?.trim() ?? ''
    if (!text) continue
    // Skip a header row.
    if (i === 0 && text.toLowerCase() === 'text') continue
    const weight = cols[1] ? clampWeight(Number.parseFloat(cols[1])) : 1
    out.push({ text, weight })
  }
  return out
}
