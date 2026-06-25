import { describe, expect, it } from 'vitest'
import { encodeWav, type AudioBufferLike } from './wav'

function buf(channels: number[][], sampleRate = 8000): AudioBufferLike {
  return {
    numberOfChannels: channels.length,
    length: channels[0].length,
    sampleRate,
    getChannelData: (c) => Float32Array.from(channels[c]),
  }
}

function readString(view: DataView, offset: number, len: number): string {
  let s = ''
  for (let i = 0; i < len; i++) s += String.fromCharCode(view.getUint8(offset + i))
  return s
}

describe('encodeWav', () => {
  it('writes a valid 16-bit PCM mono header and samples', () => {
    const ab = encodeWav(buf([[0, 0.5, -0.5, 1]], 8000))
    expect(ab.byteLength).toBe(44 + 4 * 1 * 2)

    const v = new DataView(ab)
    expect(readString(v, 0, 4)).toBe('RIFF')
    expect(readString(v, 8, 4)).toBe('WAVE')
    expect(readString(v, 12, 4)).toBe('fmt ')
    expect(readString(v, 36, 4)).toBe('data')
    expect(v.getUint16(20, true)).toBe(1) // PCM
    expect(v.getUint16(22, true)).toBe(1) // channels
    expect(v.getUint32(24, true)).toBe(8000) // sample rate
    expect(v.getUint16(34, true)).toBe(16) // bits per sample
    expect(v.getUint32(40, true)).toBe(8) // data size

    // sample values (truncated toward zero by setInt16)
    expect(v.getInt16(46, true)).toBe(16383) // 0.5
    expect(v.getInt16(48, true)).toBe(-16384) // -0.5
    expect(v.getInt16(50, true)).toBe(32767) // 1.0 (clamped)
  })

  it('accounts for channel count in the data size', () => {
    const ab = encodeWav(buf([[0, 0], [0, 0]], 44100))
    expect(ab.byteLength).toBe(44 + 2 * 2 * 2)
  })
})
