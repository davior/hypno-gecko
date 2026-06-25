import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AudioEngine } from '../../audio/AudioEngine'
import { LIMITS, type BeatMethod, type NoiseType } from '../../audio/types'
import { createSpeaker } from '../../affirmations/createSpeaker'
import { Segmented } from '../../components/ui/Segmented'
import { Slider } from '../../components/ui/Slider'
import { Toggle } from '../../components/ui/Toggle'
import { NOISE_TYPES } from '../../data/ambient'
import { BEAT_METHODS } from '../../data/methods'
import { SESSION_TEMPLATES } from '../../data/sessionTemplates'
import { renderBedToWav, isExportSupported } from '../../session/render'
import {
  SessionPlayer,
  type SessionProgress,
} from '../../session/SessionPlayer'
import {
  EMERGENCE_INFO,
  INDUCTION_INFO,
  MAX_EXPORT_SEC,
  type EmergenceType,
  type InductionType,
} from '../../session/types'
import { useAffirmations } from '../../state/affirmationStore'
import { useSession } from '../../state/sessionStore'
import { mmss } from '../../utils/time'
import { TimelineView } from './TimelineView'

function Panel({
  title,
  desc,
  children,
}: {
  title: string
  desc?: string
  children: ReactNode
}) {
  return (
    <section className="card space-y-4 p-5">
      <div>
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-slate-200">
          {title}
        </h2>
        {desc && <p className="mt-1 text-xs text-slate-500">{desc}</p>}
      </div>
      {children}
    </section>
  )
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'session'
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function SessionPage() {
  const session = useSession((s) => s.session)
  const applyTemplate = useSession((s) => s.applyTemplate)
  const patch = useSession((s) => s.patch)
  const patchInduction = useSession((s) => s.patchInduction)
  const patchEmergence = useSession((s) => s.patchEmergence)
  const patchMain = useSession((s) => s.patchMain)
  const patchBeat = useSession((s) => s.patchBeat)
  const patchRamp = useSession((s) => s.patchRamp)
  const patchAmbient = useSession((s) => s.patchAmbient)
  const importSession = useSession((s) => s.importSession)

  const sets = useAffirmations((s) => s.sets)
  const delivery = useAffirmations((s) => s.delivery)
  const tts = useAffirmations((s) => s.tts)

  const audioSupported = AudioEngine.isSupported
  const playerRef = useRef<SessionPlayer | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [progress, setProgress] = useState<SessionProgress | null>(null)
  const [playing, setPlaying] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [notice, setNotice] = useState<{
    tone: 'warn' | 'error' | 'ok'
    text: string
  } | null>(null)

  useEffect(() => () => playerRef.current?.stop(), [])

  const main = session.main
  const beat = main.beat

  const handleToggle = () => {
    if (playing) {
      playerRef.current?.stop()
      setPlaying(false)
      return
    }
    if (!audioSupported) return
    const speaker = createSpeaker(tts)
    const set = sets.find((s) => s.id === main.affirmationSetId)
    const player = playerRef.current ?? new SessionPlayer()
    playerRef.current = player
    setNotice(null)
    setPlaying(true)
    player.play(session, {
      speaker,
      affirmations: set?.affirmations ?? [],
      speakOptions: {
        rate: delivery.rate,
        pitch: delivery.pitch,
        volume: delivery.volume,
        voiceURI: delivery.voiceURI,
      },
      onProgress: (p) => {
        setProgress(p)
        if (p.phase === 'done') setPlaying(false)
      },
    })
  }

  const exportJson = () =>
    download(
      new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' }),
      `${slug(session.name)}.json`,
    )

  const onImportFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const ok = importSession(String(reader.result ?? ''))
      setNotice(
        ok
          ? { tone: 'ok', text: 'Session imported.' }
          : { tone: 'error', text: 'That file isn’t a valid session.' },
      )
    }
    reader.readAsText(file)
  }

  const exportWav = async () => {
    if (!isExportSupported()) {
      setNotice({ tone: 'error', text: 'Audio export isn’t supported here.' })
      return
    }
    setExporting(true)
    setNotice(null)
    try {
      download(await renderBedToWav(session), `${slug(session.name)}.wav`)
    } catch {
      setNotice({ tone: 'error', text: 'Export failed while rendering audio.' })
    } finally {
      setExporting(false)
    }
  }

  const elapsed = progress?.elapsedSec ?? 0

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold text-white">
          Session Builder
        </h1>
        <p className="text-sm text-slate-400">
          Where everything comes together — guide yourself from induction, through
          the main programming block, into a gentle emergence.
        </p>
      </header>

      <Panel title="Templates" desc="Start from a prebuilt session, then tweak.">
        <div className="flex flex-wrap gap-1.5">
          {SESSION_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              title={t.blurb}
              onClick={() => applyTemplate(t.id)}
              className="pill bg-white/5 text-slate-200 ring-1 ring-inset ring-white/10 hover:bg-white/10"
            >
              {t.name}
            </button>
          ))}
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Induction" desc={INDUCTION_INFO[session.induction.type].blurb}>
          <Segmented<InductionType>
            ariaLabel="Induction type"
            columns={3}
            value={session.induction.type}
            onChange={(type) => patchInduction({ type })}
            options={(Object.keys(INDUCTION_INFO) as InductionType[]).map((k) => ({
              value: k,
              label: INDUCTION_INFO[k].label,
            }))}
          />
          {session.induction.type !== 'none' && (
            <Slider
              label="Induction length"
              value={Math.round(session.induction.durationSec / 60)}
              min={1}
              max={20}
              step={1}
              unit="min"
              onChange={(v) => patchInduction({ durationSec: v * 60 })}
            />
          )}
        </Panel>

        <Panel title="Emergence" desc={EMERGENCE_INFO[session.emergence.type].blurb}>
          <Segmented<EmergenceType>
            ariaLabel="Emergence type"
            columns={2}
            value={session.emergence.type}
            onChange={(type) => patchEmergence({ type })}
            options={(Object.keys(EMERGENCE_INFO) as EmergenceType[]).map((k) => ({
              value: k,
              label: EMERGENCE_INFO[k].label,
            }))}
          />
          {session.emergence.type !== 'none' && (
            <Slider
              label="Emergence length"
              value={Math.round(session.emergence.durationSec / 60)}
              min={1}
              max={10}
              step={1}
              unit="min"
              onChange={(v) => patchEmergence({ durationSec: v * 60 })}
            />
          )}
        </Panel>
      </div>

      <Panel title="Main block" desc="The core programming phase.">
        <div className="space-y-5">
          <Segmented<BeatMethod>
            ariaLabel="Beat method"
            columns={4}
            value={beat.method}
            onChange={(method) => patchBeat({ method })}
            options={BEAT_METHODS.map((m) => ({ value: m.id, label: m.name }))}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Slider
              label="Beat (start)"
              value={beat.beatHz}
              min={LIMITS.beatHz.min}
              max={LIMITS.beatHz.max}
              step={0.5}
              precision={1}
              unit="Hz"
              onChange={(v) => patchBeat({ beatHz: v })}
            />
            <Slider
              label="Main length"
              value={Math.round(main.durationSec / 60)}
              min={1}
              max={120}
              step={1}
              unit="min"
              onChange={(v) => patchMain({ durationSec: v * 60 })}
            />
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-4">
            <div>
              <p className="text-sm font-medium text-slate-200">Beat ramp</p>
              <p className="text-xs text-slate-500">
                Glide the beat across the main block (e.g. Alpha → Theta).
              </p>
            </div>
            <Toggle
              label="Enable beat ramp"
              checked={beat.ramp.enabled}
              onChange={(enabled) => patchRamp({ enabled })}
            />
          </div>
          {beat.ramp.enabled && (
            <Slider
              label="Beat (target)"
              value={beat.ramp.targetBeatHz}
              min={LIMITS.beatHz.min}
              max={LIMITS.beatHz.max}
              step={0.5}
              precision={1}
              unit="Hz"
              onChange={(v) => patchRamp({ targetBeatHz: v })}
            />
          )}

          <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-4">
            <p className="text-sm font-medium text-slate-200">Ambient bed</p>
            <Toggle
              label="Enable ambient"
              checked={main.ambient.enabled}
              onChange={(enabled) => patchAmbient({ enabled })}
            />
          </div>
          {main.ambient.enabled && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Segmented<NoiseType>
                ariaLabel="Ambient noise type"
                columns={3}
                value={main.ambient.type}
                onChange={(type) => patchAmbient({ type })}
                options={NOISE_TYPES.map((n) => ({ value: n.id, label: n.name }))}
              />
              <Slider
                label="Ambient volume"
                value={Math.round(main.ambient.volume * 100)}
                min={0}
                max={100}
                step={1}
                unit="%"
                onChange={(v) => patchAmbient({ volume: v / 100 })}
              />
            </div>
          )}

          <div className="space-y-1.5 border-t border-white/5 pt-4">
            <label className="label" htmlFor="aff-set">
              Affirmations
            </label>
            <select
              id="aff-set"
              value={main.affirmationSetId ?? ''}
              onChange={(e) =>
                patchMain({ affirmationSetId: e.target.value || null })
              }
              className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-inset ring-white/10 focus:ring-violet/60"
            >
              <option value="">None</option>
              {sets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.affirmations.length})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">
              Spoken through your Affirmations TTS settings, spaced across the main
              block.
            </p>
          </div>
        </div>
      </Panel>

      <Panel title="Timeline">
        <input
          value={session.name}
          onChange={(e) => patch({ name: e.target.value })}
          aria-label="Session name"
          className="w-full bg-transparent font-display text-lg font-bold text-white outline-none"
        />
        <TimelineView session={session} elapsedSec={elapsed} playing={playing} />

        <div className="flex flex-wrap items-center gap-4 border-t border-white/5 pt-4">
          <button
            type="button"
            onClick={handleToggle}
            disabled={!audioSupported}
            className={[
              'btn h-12 w-12 shrink-0 rounded-full p-0 text-night-950 shadow-lg',
              playing ? 'bg-rose hover:bg-rose/90' : 'bg-mint hover:bg-mint/90',
            ].join(' ')}
            aria-label={playing ? 'Stop session' : 'Play session'}
          >
            {playing ? (
              <svg viewBox="0 0 24 24" className="mx-auto h-5 w-5" fill="currentColor" aria-hidden>
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="mx-auto h-5 w-5" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <div className="min-w-0 flex-1 text-sm">
            {playing && progress ? (
              <>
                <p className="font-medium text-slate-200">
                  {progress.phaseLabel || '…'}
                  {progress.beatHz != null && (
                    <span className="ml-2 font-mono text-xs text-slate-500">
                      {progress.beatHz.toFixed(2)} Hz
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {progress.nowSpeaking
                    ? `“${progress.nowSpeaking}”`
                    : `${mmss(elapsed)} / ${mmss(progress.totalSec)}`}
                </p>
              </>
            ) : (
              <p className="text-slate-500">
                {audioSupported
                  ? 'Press play to begin the session.'
                  : 'Web Audio isn’t available in this browser.'}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
          <button type="button" className="btn-ghost text-sm" onClick={exportJson}>
            Export JSON
          </button>
          <button
            type="button"
            className="btn-ghost text-sm"
            onClick={() => fileRef.current?.click()}
          >
            Import JSON
          </button>
          <button
            type="button"
            className="btn-ghost text-sm"
            onClick={() => void exportWav()}
            disabled={exporting}
          >
            {exporting ? 'Rendering…' : 'Export WAV'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onImportFile(file)
              e.target.value = ''
            }}
          />
          <span className="text-xs text-slate-500">
            WAV = beat + ambient bed only (no voice), up to {MAX_EXPORT_SEC / 60} min.
          </span>
        </div>

        {notice && (
          <p
            className={[
              'text-xs',
              notice.tone === 'error'
                ? 'text-rose'
                : notice.tone === 'ok'
                  ? 'text-mint'
                  : 'text-ember',
            ].join(' ')}
          >
            {notice.text}
          </p>
        )}
      </Panel>
    </div>
  )
}
