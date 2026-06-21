/**
 * Core types for the Frequency & Beat Generator (Module 3).
 *
 * A "carrier" is the audible tone you actually hear (e.g. 200 Hz).
 * A "beat" is the low entrainment frequency the brain is nudged toward
 * (e.g. 6 Hz theta) — it is never heard directly, it emerges from the method.
 */

export type BeatMethod = 'binaural' | 'monaural' | 'am' | 'isochronic'

export interface BeatMethodInfo {
  id: BeatMethod
  name: string
  tagline: string
  description: string
  requiresHeadphones: boolean
}

export type Waveform = 'sine' | 'triangle' | 'square' | 'sawtooth'

/** A linear glide of the beat frequency over the course of a session. */
export interface BeatRamp {
  enabled: boolean
  /** Beat frequency to arrive at, in Hz. */
  targetBeatHz: number
  /** How long the glide takes, in seconds. */
  durationSec: number
}

/** The full configuration consumed by the audio engine. */
export interface GeneratorConfig {
  method: BeatMethod
  /** Audible base frequency in Hz. */
  carrierHz: number
  /** Target entrainment frequency in Hz. */
  beatHz: number
  waveform: Waveform

  /** Amplitude-modulation depth, 0..1 (AM method only). */
  modDepth: number

  /** Fraction of each pulse that is "on", 0..1 (isochronic only). */
  dutyCycle: number
  /** Edge softness of the isochronic gate, in milliseconds. */
  gateRampMs: number

  ramp: BeatRamp

  /** Output level, 0..1. */
  masterVolume: number
}

export const DEFAULT_CONFIG: GeneratorConfig = {
  method: 'isochronic',
  carrierHz: 200,
  beatHz: 10,
  waveform: 'sine',
  modDepth: 0.8,
  dutyCycle: 0.5,
  gateRampMs: 8,
  ramp: {
    enabled: false,
    targetBeatHz: 6,
    durationSec: 600,
  },
  masterVolume: 0.5,
}

/** Safe operating envelope for user-facing controls. */
export const LIMITS = {
  carrierHz: { min: 20, max: 1500 },
  beatHz: { min: 0.5, max: 50 },
  modDepth: { min: 0, max: 1 },
  dutyCycle: { min: 0.1, max: 0.9 },
  gateRampMs: { min: 0, max: 80 },
  masterVolume: { min: 0, max: 1 },
} as const
