import type { Affirmation, DeliveryConfig } from './types'

/** Fisher–Yates shuffle returning a new array. `rng` is injectable for tests. */
export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Expand a set into the ordered sequence of affirmations to speak, honouring
 * repetition and sequencing mode. Pure and deterministic given `rng`.
 *
 *  - linear:   the set in order, repeated `repetitions` times (a,b,c,a,b,c…)
 *  - shuffle:  `repetitions` independently-shuffled passes
 *  - weighted: a pool where each appears `repetitions × weight` times, shuffled
 */
export function buildPlaylist(
  affirmations: Affirmation[],
  config: DeliveryConfig,
  rng: () => number = Math.random,
): Affirmation[] {
  const reps = Math.max(1, Math.floor(config.repetitions))
  const items = affirmations.filter((a) => a.text.trim().length > 0)
  if (items.length === 0) return []

  if (config.sequencing === 'linear') {
    const out: Affirmation[] = []
    for (let r = 0; r < reps; r++) out.push(...items)
    return out
  }

  if (config.sequencing === 'shuffle') {
    const out: Affirmation[] = []
    for (let r = 0; r < reps; r++) out.push(...shuffle(items, rng))
    return out
  }

  // weighted
  const pool: Affirmation[] = []
  for (const a of items) {
    const count = reps * Math.max(1, Math.floor(a.weight))
    for (let i = 0; i < count; i++) pool.push(a)
  }
  return shuffle(pool, rng)
}
