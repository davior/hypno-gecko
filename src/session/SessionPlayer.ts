import { audioEngine } from '../audio/AudioEngine'
import type { SpeakOptions, Speaker } from '../affirmations/speech'
import type { Affirmation } from '../affirmations/types'
import {
  affirmationFireTimes,
  affirmationSlots,
  buildTimeline,
  emergenceBeat,
  inductionBeat,
  mainBeat,
  type PhaseKind,
} from './schedule'
import { BREATHING_CUES, PMR_LINES, countdownLines, countupLines } from './scripts'
import type { InductionType, SessionConfig } from './types'

export interface SessionProgress {
  phase: PhaseKind | 'done'
  phaseLabel: string
  elapsedSec: number
  totalSec: number
  beatHz: number | null
  nowSpeaking: string | null
}

export interface SessionPlayOptions {
  speaker: Speaker
  affirmations: Affirmation[]
  speakOptions: SpeakOptions
  onProgress: (p: SessionProgress) => void
}

interface ScheduledEvent {
  atSec: number
  phase: PhaseKind
  phaseLabel: string
  run: () => void
}

function inductionLines(type: InductionType): string[] {
  if (type === 'countdown') return countdownLines(10)
  if (type === 'pmr') return PMR_LINES
  if (type === 'breathing') {
    const out: string[] = []
    for (let i = 0; i < 8; i++) out.push(...BREATHING_CUES)
    return out
  }
  return [] // tonal / none — no speech
}

/** Even offsets within a phase for a list of spoken lines. */
function spaceLines(lines: string[], durationSec: number): [number, string][] {
  if (lines.length === 0) return []
  const step = durationSec / (lines.length + 1)
  return lines.map((text, i) => [Math.round(step * (i + 1)), text])
}

/**
 * Orchestrates a full session over the singleton audio engine and a Speaker:
 * induction → main → emergence, with spoken induction/emergence scripts and
 * affirmations spaced through the main phase.
 */
export class SessionPlayer {
  private timers: ReturnType<typeof setTimeout>[] = []
  private ticker: ReturnType<typeof setInterval> | null = null
  private speakClear: ReturnType<typeof setTimeout> | null = null
  private stopped = true
  private startMs = 0
  private totalSec = 0
  private nowSpeaking: string | null = null
  private phase: { kind: PhaseKind | 'done'; label: string } = { kind: 'done', label: '' }
  private opts: SessionPlayOptions | null = null

  get isPlaying(): boolean {
    return this.ticker !== null
  }

  play(session: SessionConfig, opts: SessionPlayOptions): void {
    this.stop()
    this.stopped = false
    this.opts = opts

    const timeline = buildTimeline(session)
    this.totalSec = timeline.totalSec
    this.startMs = Date.now()

    const events: ScheduledEvent[] = []
    for (const phase of timeline.phases) {
      events.push({
        atSec: phase.startSec,
        phase: phase.kind,
        phaseLabel: phase.label,
        run: () => this.enterPhase(session, phase.kind),
      })

      const speech =
        phase.kind === 'main'
          ? this.mainAffirmations(phase.durationSec, opts.affirmations)
          : phase.kind === 'induction'
            ? spaceLines(inductionLines(session.induction.type), phase.durationSec)
            : spaceLines(countupLines(5), phase.durationSec)

      for (const [offset, text] of speech) {
        events.push({
          atSec: phase.startSec + offset,
          phase: phase.kind,
          phaseLabel: phase.label,
          run: () => this.speak(text),
        })
      }
    }

    for (const ev of events) {
      this.timers.push(
        setTimeout(() => {
          if (this.stopped) return
          this.phase = { kind: ev.phase, label: ev.phaseLabel }
          ev.run()
        }, Math.max(0, ev.atSec * 1000)),
      )
    }
    this.timers.push(setTimeout(() => this.finish(), this.totalSec * 1000))

    this.ticker = setInterval(() => this.emit(), 250)
    this.emit()
  }

  private mainAffirmations(
    durationSec: number,
    affirmations: Affirmation[],
  ): [number, string][] {
    if (affirmations.length === 0) return []
    const slots = affirmationSlots(durationSec, affirmations.length)
    return affirmationFireTimes(durationSec, slots).map((offset, i) => [
      offset,
      affirmations[i % affirmations.length].text,
    ])
  }

  private enterPhase(session: SessionConfig, kind: PhaseKind): void {
    if (kind === 'induction') {
      void audioEngine.play(inductionBeat(session), session.main.ambient)
    } else if (kind === 'main') {
      void audioEngine.play(mainBeat(session), session.main.ambient)
    } else {
      void audioEngine.play(emergenceBeat(session), session.main.ambient)
      audioEngine.setAmbient({ ...session.main.ambient, enabled: false }) // fade out
    }
  }

  private speak(text: string): void {
    if (this.stopped || !this.opts) return
    this.nowSpeaking = text
    void this.opts.speaker.speak(text, this.opts.speakOptions)
    if (this.speakClear) clearTimeout(this.speakClear)
    const words = text.split(/\s+/).length
    this.speakClear = setTimeout(
      () => {
        this.nowSpeaking = null
      },
      Math.max(2500, words * 450),
    )
  }

  private emit(): void {
    if (!this.opts) return
    const elapsedSec = Math.min(this.totalSec, (Date.now() - this.startMs) / 1000)
    this.opts.onProgress({
      phase: this.phase.kind,
      phaseLabel: this.phase.label,
      elapsedSec,
      totalSec: this.totalSec,
      beatHz: audioEngine.currentBeatHz(),
      nowSpeaking: this.nowSpeaking,
    })
  }

  private finish(): void {
    this.phase = { kind: 'done', label: 'Complete' }
    this.nowSpeaking = null
    audioEngine.stop()
    this.emit()
    this.teardownTimers()
    this.stopped = true
  }

  stop(): void {
    this.stopped = true
    this.teardownTimers()
    if (this.opts) {
      try {
        this.opts.speaker.cancel()
      } catch {
        // ignore
      }
    }
    audioEngine.stop()
    this.nowSpeaking = null
    this.phase = { kind: 'done', label: '' }
    this.emit()
  }

  private teardownTimers(): void {
    this.timers.forEach(clearTimeout)
    this.timers = []
    if (this.ticker !== null) {
      clearInterval(this.ticker)
      this.ticker = null
    }
    if (this.speakClear) {
      clearTimeout(this.speakClear)
      this.speakClear = null
    }
  }
}
