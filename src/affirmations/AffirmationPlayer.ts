import type { Speaker } from './speech'
import type { Affirmation, DeliveryConfig } from './types'

export interface PlayerProgress {
  /** Index of the affirmation now speaking; equals `total` once finished. */
  index: number
  total: number
  text: string | null
  done: boolean
}

/**
 * Plays a prepared playlist through a Speaker, pausing `gapSec` between
 * statements and reporting progress. Stop is immediate: it cancels speech and
 * the pending gap.
 */
export class AffirmationPlayer {
  private stopped = false
  private timer: ReturnType<typeof setTimeout> | null = null
  private resolveDelay: (() => void) | null = null

  constructor(private readonly speaker: Speaker) {}

  async play(
    playlist: Affirmation[],
    config: DeliveryConfig,
    onProgress: (p: PlayerProgress) => void,
  ): Promise<void> {
    this.stopped = false
    const total = playlist.length

    for (let i = 0; i < total; i++) {
      if (this.stopped) return
      const item = playlist[i]
      onProgress({ index: i, total, text: item.text, done: false })
      await this.speaker.speak(item.text, {
        rate: config.rate,
        pitch: config.pitch,
        volume: config.volume,
        voiceURI: config.voiceURI,
      })
      if (this.stopped) return
      if (i < total - 1 && config.gapSec > 0) {
        await this.delay(config.gapSec * 1000)
      }
    }

    if (!this.stopped) {
      onProgress({ index: total, total, text: null, done: true })
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.resolveDelay = resolve
      this.timer = setTimeout(() => {
        this.timer = null
        this.resolveDelay = null
        resolve()
      }, ms)
    })
  }

  stop(): void {
    this.stopped = true
    this.speaker.cancel()
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
    if (this.resolveDelay) {
      const resolve = this.resolveDelay
      this.resolveDelay = null
      resolve()
    }
  }
}
