import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AffirmationPlayer,
  type PlayerProgress,
} from '../../affirmations/AffirmationPlayer'
import { createSpeaker } from '../../affirmations/createSpeaker'
import { buildPlaylist } from '../../affirmations/sequencing'
import { WebSpeechSpeaker } from '../../affirmations/speech'
import { useAffirmations } from '../../state/affirmationStore'
import { AffirmationEditor } from './AffirmationEditor'
import { DeliveryPanel } from './DeliveryPanel'
import { PlayerBar, type PlayerNotice } from './PlayerBar'
import { SetSidebar } from './SetSidebar'

export function AffirmationsPage() {
  const sets = useAffirmations((s) => s.sets)
  const activeSetId = useAffirmations((s) => s.activeSetId)
  const delivery = useAffirmations((s) => s.delivery)
  const tts = useAffirmations((s) => s.tts)

  const browserSupported = WebSpeechSpeaker.isSupported
  const playerRef = useRef<AffirmationPlayer | null>(null)

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voicesChecked, setVoicesChecked] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState<PlayerProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  const speaker = useMemo(() => createSpeaker(tts), [tts])

  const activeSet = sets.find((s) => s.id === activeSetId) ?? sets[0]
  const count = activeSet?.affirmations.length ?? 0

  // Load browser voices (they arrive asynchronously) when using that engine.
  useEffect(() => {
    if (tts.engine !== 'browser' || !browserSupported) {
      setVoicesChecked(true)
      return
    }
    setVoicesChecked(false)
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    const timer = window.setTimeout(() => setVoicesChecked(true), 1500)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load)
      window.clearTimeout(timer)
    }
  }, [tts.engine, browserSupported])

  // Stop playback when leaving the page or switching engines mid-session.
  useEffect(() => {
    return () => playerRef.current?.stop()
  }, [speaker])

  const playable =
    count > 0 &&
    (tts.engine === 'deepgram'
      ? tts.deepgramKey.trim().length > 0
      : browserSupported)

  const handleToggle = async () => {
    if (playing) {
      playerRef.current?.stop()
      setPlaying(false)
      return
    }
    if (!activeSet) return
    const playlist = buildPlaylist(activeSet.affirmations, delivery)
    if (playlist.length === 0) return

    const player = new AffirmationPlayer(speaker)
    playerRef.current = player
    setError(null)
    setPlaying(true)
    try {
      await player.play(playlist, delivery, setProgress)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Playback failed.')
    } finally {
      setPlaying(false)
    }
  }

  const notice: PlayerNotice | null = error
    ? { tone: 'error', text: error }
    : tts.engine === 'deepgram' && tts.deepgramKey.trim().length === 0
      ? { tone: 'warn', text: 'Enter your Deepgram API key to enable playback.' }
      : tts.engine === 'browser' && !browserSupported
        ? { tone: 'warn', text: 'Text-to-speech isn’t available in this browser.' }
        : tts.engine === 'browser' && voicesChecked && voices.length === 0
          ? {
              tone: 'warn',
              text: 'No system voices found (common in Firefox on Linux). Switch to Deepgram, or install OS voices.',
            }
          : null

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold text-white">
          Affirmation Engine
        </h1>
        <p className="text-sm text-slate-400">
          Build personal affirmation libraries and have them spoken back to you.
          Write your own or import a list, then shape the delivery.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[16rem_1fr]">
        <SetSidebar />
        <div className="space-y-5">
          <AffirmationEditor />
          <div className="card space-y-4 p-5">
            <div>
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-slate-200">
                Delivery
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                How the affirmations are spoken (Module 2 — Text-to-Speech).
              </p>
            </div>
            <DeliveryPanel
              voices={voices}
              browserSupported={browserSupported}
              voicesChecked={voicesChecked}
            />
          </div>
        </div>
      </div>

      <PlayerBar
        playable={playable}
        playing={playing}
        progress={progress}
        count={count}
        notice={notice}
        onToggle={handleToggle}
      />
    </div>
  )
}
