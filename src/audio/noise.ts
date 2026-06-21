import { clamp } from './beatMath'
import type { NoiseType } from './types'

/**
 * Generate one channel of coloured noise.
 *
 * Pure and context-free so it can be unit-tested; `makeNoiseBuffer` wraps it
 * into a Web Audio buffer. Output is bounded to [-1, 1].
 *
 *  - white: flat spectrum (equal energy per Hz)
 *  - pink:  -3 dB/octave (equal energy per octave) — Paul Kellet's filter
 *  - brown: -6 dB/octave (integrated white) — deep, soft, rumbling
 */
export function generateNoiseData(type: NoiseType, length: number): Float32Array {
  const data = new Float32Array(length)

  if (type === 'white') {
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1
    }
    return data
  }

  if (type === 'pink') {
    let b0 = 0
    let b1 = 0
    let b2 = 0
    let b3 = 0
    let b4 = 0
    let b5 = 0
    let b6 = 0
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.969 * b2 + white * 0.153852
      b3 = 0.8665 * b3 + white * 0.3104856
      b4 = 0.55 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.016898
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
      b6 = white * 0.115926
      data[i] = clamp(pink * 0.11, -1, 1)
    }
    return data
  }

  // brown
  let last = 0
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = clamp(last * 3.5, -1, 1)
  }
  return data
}

/** Build a looping noise AudioBuffer of `seconds` length. */
export function makeNoiseBuffer(
  ctx: BaseAudioContext,
  type: NoiseType,
  seconds = 2,
): AudioBuffer {
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds))
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  buffer.getChannelData(0).set(generateNoiseData(type, length))
  return buffer
}
