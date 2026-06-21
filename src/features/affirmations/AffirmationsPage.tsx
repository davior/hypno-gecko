import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AffirmationPlayer,
  type PlayerProgress,
} from '../../affirmations/AffirmationPlayer'
import { buildPlaylist } from '../../affirmations/sequencing'
import { WebSpeechSpeaker } from '../../affirmations/speech'
import { useAffirmations } from '../../state/affirmationStore'
import { AffirmationEditor } from './AffirmationEditor'
import { DeliveryPanel } from './DeliveryPanel'
import { PlayerBar } from './PlayerBar'
import { SetSidebar } from './SetSidebar'

export function AffirmationsPage() {
  const sets = useAffirmations((s) => s.sets)
  const activeSetId = useAffirmations((s) => s.activeSetId)
  const delivery = useAffirmations((s) => s.delivery)

  const speaker = useMemo(() => new WebSpeechSpeaker(), [])
  const supported = WebSpeechSpeaker.isSupported
  const playerRef = useRef<AffirmationPlayer | null>(null)

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState<PlayerProgress | null>(null)

  const activeSet = sets.find((s) => s.id === activeSetId) ?? sets[0]
  const count = activeSet?.affirmations.length ?? 0

  // Load Web Speech voices (they arrive asynchronously).
  useEffect(() => {
    if (!supported) return
    const load = () => setVoices(speaker.getVoices())
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [supported, speaker])

  // Stop any speech when leaving the page.
  useEffect(() => {
    return () => playerRef.current?.stop()
  }, [])

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
    setPlaying(true)
    await player.play(playlist, delivery, setProgress)
    setPlaying(false)
  }

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
            <DeliveryPanel voices={voices} supported={supported} />
          </div>
        </div>
      </div>

      <PlayerBar
        supported={supported}
        playing={playing}
        progress={progress}
        count={count}
        onToggle={handleToggle}
      />
    </div>
  )
}
