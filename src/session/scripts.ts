/**
 * Spoken-word scripts for induction and emergence. Plain data so they're easy
 * to read, tweak, and test.
 */

const COUNTDOWN_SUFFIXES = [
  'drifting deeper',
  'letting go',
  'softer and slower',
  'sinking down',
  'deeper still',
  'completely at ease',
  'heavier and warmer',
  'far, far down',
  'almost there',
  'deeply, deeply relaxed',
]

const NUMBER_WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
]

function numberWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n)
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

/** Deepening countdown from `from` down to 1. */
export function countdownLines(from = 10): string[] {
  const lines: string[] = []
  for (let n = from; n >= 1; n--) {
    const suffix = COUNTDOWN_SUFFIXES[n - 1] ?? 'deeper'
    lines.push(`${capitalize(numberWord(n))}… ${suffix}.`)
  }
  return lines
}

/** Re-orienting count-up from 1 to `to`. */
export function countupLines(to = 5): string[] {
  const lines: string[] = []
  for (let n = 1; n <= to; n++) {
    let suffix = 'coming back'
    if (n === 1) suffix = 'becoming aware of the room'
    else if (n === to) suffix = 'eyes open, refreshed and fully awake'
    else if (n === to - 1) suffix = 'energy returning to your body'
    lines.push(`${capitalize(numberWord(n))}… ${suffix}.`)
  }
  return lines
}

/** A short progressive-muscle-relaxation body scan. */
export const PMR_LINES: string[] = [
  'Let your eyes close, and take a slow, full breath in… and release.',
  'Bring your attention to your feet. Tense them gently… and let go.',
  'Feel your lower legs and knees soften and grow heavy.',
  'Let the relaxation flow up through your thighs and hips.',
  'Allow your stomach and lower back to release all tension.',
  'Soften your chest and shoulders, letting them drop away from your ears.',
  'Relax your arms, all the way down to your fingertips.',
  'Let your neck and jaw unclench, your face becoming smooth and calm.',
  'And now your whole body is loose, heavy, and deeply at rest.',
]

/** Paced breathing cues (in / hold / out) for the breathing induction. */
export const BREATHING_CUES: string[] = [
  'Breathe in…',
  'Hold…',
  'And slowly out…',
]
