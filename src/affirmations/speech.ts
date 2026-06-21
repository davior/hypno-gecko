export interface SpeakOptions {
  rate: number
  pitch: number
  volume: number
  voiceURI: string | null
}

/**
 * Speaks a phrase and resolves when it finishes. Abstracted so the player can
 * be driven by a fake in tests (the Web Speech API isn't available in jsdom).
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
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = opts.rate
      utterance.pitch = opts.pitch
      utterance.volume = opts.volume
      if (opts.voiceURI) {
        const voice = this.getVoices().find((v) => v.voiceURI === opts.voiceURI)
        if (voice) utterance.voice = voice
      }
      // Resolve on both end and error so the sequence never stalls.
      utterance.onend = () => resolve()
      utterance.onerror = () => resolve()
      window.speechSynthesis.speak(utterance)
    })
  }

  cancel(): void {
    if (WebSpeechSpeaker.isSupported) window.speechSynthesis.cancel()
  }
}
