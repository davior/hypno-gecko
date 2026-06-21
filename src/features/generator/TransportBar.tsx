import { bandForBeat } from '../../data/brainwaves'
import { methodInfo } from '../../data/methods'
import { useGenerator } from '../../state/generatorStore'

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  )
}

export function TransportBar() {
  const playing = useGenerator((s) => s.engineState === 'playing')
  const method = useGenerator((s) => s.config.method)
  const carrierHz = useGenerator((s) => s.config.carrierHz)
  const beatHz = useGenerator((s) => s.config.beatHz)
  const volume = useGenerator((s) => s.config.masterVolume)
  const supported = useGenerator((s) => s.supported)
  const toggle = useGenerator((s) => s.toggle)
  const setConfig = useGenerator((s) => s.setConfig)

  const band = bandForBeat(beatHz)
  const needsHeadphones = methodInfo(method).requiresHeadphones

  return (
    <div className="sticky bottom-4 z-10 mt-6">
      <div className="card flex flex-wrap items-center gap-4 px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={() => void toggle()}
          disabled={!supported}
          className={[
            'btn h-12 w-12 rounded-full p-0 text-night-950 shadow-lg',
            playing
              ? 'bg-rose hover:bg-rose/90'
              : 'bg-mint hover:bg-mint/90',
          ].join(' ')}
          aria-label={playing ? 'Stop' : 'Play'}
        >
          {playing ? <StopIcon /> : <PlayIcon />}
        </button>

        <div className="min-w-[8rem] flex-1">
          <div className="flex items-baseline gap-2 font-mono text-sm text-slate-200">
            <span>{carrierHz.toFixed(carrierHz % 1 ? 1 : 0)} Hz</span>
            <span className="text-slate-600">carrier</span>
            <span className="text-slate-600">·</span>
            <span>{beatHz.toFixed(beatHz % 1 ? 2 : 0)} Hz</span>
            <span className="text-slate-600">beat</span>
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            {methodInfo(method).name}
            {band && ` · ${band.name}`}
            {needsHeadphones && ' · 🎧 headphones required'}
          </div>
        </div>

        <label className="flex items-center gap-2" title="Master volume">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 text-slate-400"
            fill="currentColor"
            aria-hidden
          >
            <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2a4.5 4.5 0 00-2.5-4v8a4.5 4.5 0 002.5-4z" />
          </svg>
          <input
            type="range"
            aria-label="Master volume"
            className="w-28"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setConfig({ masterVolume: parseFloat(e.target.value) })}
          />
        </label>
      </div>

      {!supported && (
        <p className="mt-2 text-center text-xs text-rose">
          Web Audio isn’t available in this browser — playback is disabled.
        </p>
      )}
    </div>
  )
}
