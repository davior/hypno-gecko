import type { Speaker, SpeakOptions } from './speech'

export interface DeepgramVoice {
  id: string
  name: string
}

/** A curated subset of Deepgram Aura voices. */
export const DEEPGRAM_VOICES: DeepgramVoice[] = [
  { id: 'aura-asteria-en', name: 'Asteria — warm female (US)' },
  { id: 'aura-luna-en', name: 'Luna — soft female (US)' },
  { id: 'aura-stella-en', name: 'Stella — calm female (US)' },
  { id: 'aura-athena-en', name: 'Athena — mature female (UK)' },
  { id: 'aura-orion-en', name: 'Orion — warm male (US)' },
  { id: 'aura-zeus-en', name: 'Zeus — deep male (US)' },
]

interface FetchResponse {
  ok: boolean
  status: number
  blob(): Promise<Blob>
}
type FetchFn = (input: string, init: RequestInit) => Promise<FetchResponse>

interface AudioLike {
  playbackRate: number
  volume: number
  src: string
  onended: (() => void) | null
  onerror: (() => void) | null
  play(): Promise<void> | void
  pause(): void
}

export interface DeepgramSpeakerOptions {
  apiKey: string
  model: string
  fetchFn?: FetchFn
  createAudio?: (url: string) => AudioLike
  makeObjectURL?: (blob: Blob) => string
  revokeObjectURL?: (url: string) => void
}

const ENDPOINT = 'https://api.deepgram.com/v1/speak'

/**
 * Deepgram Aura text-to-speech. Synthesises each phrase server-side and plays
 * the returned audio, so it works in any browser (including Firefox) regardless
 * of installed system voices.
 *
 * The user supplies their own API key. Affirmation text is sent to Deepgram's
 * servers when this engine is active — an explicit opt-in that needs a network
 * connection. All collaborators (fetch, Audio, object URLs) are injectable so
 * the class is unit-testable.
 */
export class DeepgramSpeaker implements Speaker {
  private readonly apiKey: string
  private readonly model: string
  private readonly fetchFn: FetchFn
  private readonly createAudio: (url: string) => AudioLike
  private readonly makeObjectURL: (blob: Blob) => string
  private readonly revokeObjectURL: (url: string) => void
  private current: AudioLike | null = null
  private resolveCurrent: (() => void) | null = null
  private cancelled = false

  constructor(opts: DeepgramSpeakerOptions) {
    this.apiKey = opts.apiKey
    this.model = opts.model
    this.fetchFn = opts.fetchFn ?? ((input, init) => fetch(input, init))
    this.createAudio =
      opts.createAudio ?? ((url) => new Audio(url) as unknown as AudioLike)
    this.makeObjectURL = opts.makeObjectURL ?? ((blob) => URL.createObjectURL(blob))
    this.revokeObjectURL =
      opts.revokeObjectURL ?? ((url) => URL.revokeObjectURL(url))
  }

  async speak(text: string, opts: SpeakOptions): Promise<void> {
    this.cancelled = false
    if (!this.apiKey) throw new Error('Enter your Deepgram API key first.')

    const url = `${ENDPOINT}?model=${encodeURIComponent(this.model)}&encoding=mp3`

    let res: FetchResponse
    try {
      res = await this.fetchFn(url, {
        method: 'POST',
        headers: {
          Authorization: `Token ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })
    } catch {
      throw new Error('Could not reach Deepgram (network or CORS error).')
    }

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error('Deepgram rejected the API key.')
      }
      throw new Error(`Deepgram request failed (HTTP ${res.status}).`)
    }
    if (this.cancelled) return

    const objectUrl = this.makeObjectURL(await res.blob())
    const audio = this.createAudio(objectUrl)
    audio.playbackRate = opts.rate
    audio.volume = opts.volume
    this.current = audio

    try {
      await new Promise<void>((resolve) => {
        const finish = () => {
          this.resolveCurrent = null
          resolve()
        }
        this.resolveCurrent = finish
        audio.onended = finish
        audio.onerror = finish
        const result = audio.play()
        if (result && typeof result.catch === 'function') {
          result.catch(finish)
        }
      })
    } finally {
      this.revokeObjectURL(objectUrl)
      this.current = null
    }
  }

  cancel(): void {
    this.cancelled = true
    if (this.current) {
      try {
        this.current.pause()
      } catch {
        // ignore
      }
      this.current.src = ''
      this.current = null
    }
    // Resolve any in-flight playback so the player's await doesn't hang.
    if (this.resolveCurrent) {
      const resolve = this.resolveCurrent
      this.resolveCurrent = null
      resolve()
    }
  }
}
