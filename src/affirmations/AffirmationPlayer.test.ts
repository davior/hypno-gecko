import { describe, expect, it } from 'vitest'
import { AffirmationPlayer, type PlayerProgress } from './AffirmationPlayer'
import type { Speaker } from './speech'
import {
  DEFAULT_DELIVERY,
  type Affirmation,
  type DeliveryConfig,
} from './types'

const items: Affirmation[] = [
  { id: 'a', text: 'a', weight: 1 },
  { id: 'b', text: 'b', weight: 1 },
]

function cfg(patch: Partial<DeliveryConfig> = {}): DeliveryConfig {
  return { ...DEFAULT_DELIVERY, gapSec: 0, ...patch }
}

class ImmediateSpeaker implements Speaker {
  spoken: string[] = []
  speak(text: string): Promise<void> {
    this.spoken.push(text)
    return Promise.resolve()
  }
  cancel(): void {}
}

class DeferredSpeaker implements Speaker {
  spoken: string[] = []
  private resolvers: (() => void)[] = []
  speak(text: string): Promise<void> {
    this.spoken.push(text)
    return new Promise((resolve) => this.resolvers.push(resolve))
  }
  cancel(): void {
    this.resolvers.forEach((r) => r())
    this.resolvers = []
  }
}

describe('AffirmationPlayer', () => {
  it('speaks every item in order then reports done', async () => {
    const speaker = new ImmediateSpeaker()
    const player = new AffirmationPlayer(speaker)
    const events: PlayerProgress[] = []

    await player.play(items, cfg(), (e) => events.push(e))

    expect(speaker.spoken).toEqual(['a', 'b'])
    expect(events.filter((e) => !e.done).map((e) => e.text)).toEqual(['a', 'b'])
    expect(events[events.length - 1]).toMatchObject({
      done: true,
      index: 2,
      total: 2,
    })
  })

  it('reports done immediately for an empty playlist', async () => {
    const speaker = new ImmediateSpeaker()
    const player = new AffirmationPlayer(speaker)
    const events: PlayerProgress[] = []

    await player.play([], cfg(), (e) => events.push(e))

    expect(speaker.spoken).toEqual([])
    expect(events).toEqual([{ index: 0, total: 0, text: null, done: true }])
  })

  it('stop halts before the next item and never reports done', async () => {
    const speaker = new DeferredSpeaker()
    const player = new AffirmationPlayer(speaker)
    const events: PlayerProgress[] = []

    const finished = player.play(items, cfg(), (e) => events.push(e))
    await Promise.resolve() // let play reach the first speak()
    expect(speaker.spoken).toEqual(['a'])

    player.stop()
    await finished

    expect(speaker.spoken).toEqual(['a']) // never advanced to 'b'
    expect(events.some((e) => e.done)).toBe(false)
  })
})
