import { describe, expect, it } from 'vitest'
import { DeepgramSpeaker } from './DeepgramSpeaker'
import type { SpeakOptions } from './speech'

const OPTS: SpeakOptions = { rate: 1, pitch: 1, volume: 1, voiceURI: null }

function makeFakeAudio() {
  return {
    playbackRate: 1,
    volume: 1,
    src: '',
    onended: null as (() => void) | null,
    onerror: null as (() => void) | null,
    played: false,
    paused: false,
    play(): void {
      this.played = true
    },
    pause(): void {
      this.paused = true
    },
  }
}

const flush = () => new Promise((r) => setTimeout(r, 0))

describe('DeepgramSpeaker', () => {
  it('POSTs to the speak endpoint with auth + text and plays the result', async () => {
    let captured: { url: string; init: RequestInit } | null = null
    const audio = makeFakeAudio()
    const speaker = new DeepgramSpeaker({
      apiKey: 'KEY123',
      model: 'aura-luna-en',
      fetchFn: async (url, init) => {
        captured = { url, init }
        return { ok: true, status: 200, blob: async () => new Blob(['x']) }
      },
      createAudio: () => audio,
      makeObjectURL: () => 'blob:fake',
      revokeObjectURL: () => {},
    })

    const finished = speaker.speak('I am calm', { ...OPTS, rate: 1.2, volume: 0.5 })
    await flush()

    expect(audio.played).toBe(true)
    expect(audio.playbackRate).toBe(1.2)
    expect(audio.volume).toBe(0.5)

    audio.onended?.()
    await finished

    expect(captured!.url).toContain('model=aura-luna-en')
    expect(captured!.url).toContain('encoding=mp3')
    const headers = captured!.init.headers as Record<string, string>
    expect(headers.Authorization).toBe('Token KEY123')
    expect(captured!.init.body).toBe(JSON.stringify({ text: 'I am calm' }))
  })

  it('rejects with a friendly message when the key is bad', async () => {
    const speaker = new DeepgramSpeaker({
      apiKey: 'bad',
      model: 'aura-asteria-en',
      fetchFn: async () => ({ ok: false, status: 401, blob: async () => new Blob() }),
      createAudio: () => makeFakeAudio(),
      makeObjectURL: () => 'blob:x',
      revokeObjectURL: () => {},
    })
    await expect(speaker.speak('hi', OPTS)).rejects.toThrow(/API key/i)
  })

  it('throws before any request when no key is set', async () => {
    const speaker = new DeepgramSpeaker({ apiKey: '', model: 'aura-asteria-en' })
    await expect(speaker.speak('hi', OPTS)).rejects.toThrow(/API key/i)
  })

  it('cancel resolves an in-flight playback so the player never hangs', async () => {
    const audio = makeFakeAudio()
    const speaker = new DeepgramSpeaker({
      apiKey: 'k',
      model: 'aura-asteria-en',
      fetchFn: async () => ({ ok: true, status: 200, blob: async () => new Blob() }),
      createAudio: () => audio,
      makeObjectURL: () => 'blob:x',
      revokeObjectURL: () => {},
    })

    const finished = speaker.speak('hi', OPTS)
    await flush()
    expect(audio.played).toBe(true)

    speaker.cancel()
    await finished // resolves because cancel released the pending promise
    expect(audio.paused).toBe(true)
  })
})
