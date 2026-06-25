export interface SpeakOptions {
  rate: number
  pitch: number
  volume: number
  voiceURI: string | null
}

/**
 * Speaks a phrase and resolves when it finishes. Abstracted so the player can
 * be driven by a fake in tests (the Web Speech API isn't available in jsdom),
 * and so alternate engines (e.g. Deepgram) can be swapped in.
 */
export interface Speaker {
  speak(text: string, opts: SpeakOptions): Promise<void>
  cancel(): void
}

/** Web Speech API implementation (browser only). */
export class WebSpeechSpeaker implements Speaker {
  static get isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (!WebSpeechSpeaker.isSupported) return []
    return window.speechSynthesis.getVoices()
  }

  speak(text: string, opts: SpeakOptions): Promise<void> {
    return new Promise((resolve) => {
      if (!WebSpeechSpeaker.isSupported) {
        resolve()
        return
      }
      const synth = window.speechSynthesis
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = opts.rate
      utterance.pitch = opts.pitch
      utterance.volume = opts.volume
      if (opts.voiceURI) {
        const voice = this.getVoices().find((v) => v.voiceURI === opts.voiceURI)
        if (voice) utterance.voice = voice
      }

      let done = false
      let watchdog: ReturnType<typeof setTimeout> | null = null
      const finish = () => {
        if (done) return
        done = true
        if (watchdog !== null) clearTimeout(watchdog)
        resolve()
      }
      utterance.onend = finish
      utterance.onerror = finish

      // Firefox can silently drop an utterance (e.g. no installed system
      // voices) without firing end *or* error — a watchdog guarantees the
      // sequence always advances instead of hanging.
      const words = Math.max(1, text.trim().split(/\s+/).length)
      const ceilingMs = Math.max(
        6000,
        (words / (2.5 * Math.max(opts.rate, 0.1))) * 1000 + 3000,
      )
      watchdog = setTimeout(finish, ceilingMs)

      // Firefox occasionally leaves synthesis in a paused state.
      try {
        synth.resume()
      } catch {
        // ignore
      }
      synth.speak(utterance)
    })
  }

  cancel(): void {
    if (WebSpeechSpeaker.isSupported) window.speechSynthesis.cancel()
  }
}
