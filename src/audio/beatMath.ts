/**
 * Pure, framework-free math for beat generation.
 *
 * Kept free of any Web Audio dependency so it can be unit-tested directly
 * and reasoned about in isolation from the node graph.
 */

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

/**
 * Left/right oscillator frequencies for binaural beats. The carrier sits in
 * the middle and each ear is detuned by half the beat frequency, so the
 * perceived (neurological) beat equals `beatHz`.
 *
 * Example: carrier 200, beat 6 -> { left: 197, right: 203 } -> 6 Hz beat.
 */
export function binauralFrequencies(
  carrierHz: number,
  beatHz: number,
): { left: number; right: number } {
  const half = beatHz / 2
  return { left: carrierHz - half, right: carrierHz + half }
}

/**
 * The two tone frequencies that are summed *before* output for monaural
 * beats. Their amplitude envelope physically beats at `beatHz` in the air.
 */
export function monauralFrequencies(
  carrierHz: number,
  beatHz: number,
): { a: number; b: number } {
  return { a: carrierHz, b: carrierHz + beatHz }
}

/**
 * Amplitude bounds of an AM-modulated carrier given a depth 0..1.
 * depth 0 -> steady tone [1, 1]; depth 1 -> full modulation [0, 1].
 */
export function amEnvelope(depth: number): { min: number; max: number } {
  const d = clamp(depth, 0, 1)
  return { min: 1 - d, max: 1 }
}

/** Period (seconds) of a pulse train running at `beatHz`. */
export function pulsePeriod(beatHz: number): number {
  return 1 / Math.max(beatHz, 0.0001)
}

/**
 * On-duration (seconds) of an isochronic pulse for a given beat frequency
 * and duty cycle.
 */
export function pulseOnDuration(beatHz: number, dutyCycle: number): number {
  return pulsePeriod(beatHz) * clamp(dutyCycle, 0, 1)
}

/** Linear interpolation between `from` and `to` at progress 0..1. */
export function lerp(from: number, to: number, progress: number): number {
  return from + (to - from) * clamp(progress, 0, 1)
}

/**
 * The beat frequency at elapsed time `t` for a ramp from `fromHz` to `toHz`
 * over `durationSec`. Before the ramp starts it holds `fromHz`; after it
 * completes it holds `toHz`.
 */
export function rampedBeatAt(
  fromHz: number,
  toHz: number,
  durationSec: number,
  t: number,
): number {
  if (durationSec <= 0) return toHz
  return lerp(fromHz, toHz, t / durationSec)
}
