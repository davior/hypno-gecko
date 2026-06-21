import type { PlayerProgress } from '../../affirmations/AffirmationPlayer'

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

export function PlayerBar({
  supported,
  playing,
  progress,
  count,
  onToggle,
}: {
  supported: boolean
  playing: boolean
  progress: PlayerProgress | null
  count: number
  onToggle: () => void
}) {
  const speaking = playing && progress && !progress.done ? progress.text : null

  return (
    <div className="sticky bottom-4 z-10 mt-6">
      <div className="card flex items-center gap-4 px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={onToggle}
          disabled={!supported || count === 0}
          className={[
            'btn h-12 w-12 shrink-0 rounded-full p-0 text-night-950 shadow-lg',
            playing ? 'bg-rose hover:bg-rose/90' : 'bg-mint hover:bg-mint/90',
          ].join(' ')}
          aria-label={playing ? 'Stop' : 'Play affirmations'}
        >
          {playing ? <StopIcon /> : <PlayIcon />}
        </button>

        <div className="min-w-0 flex-1">
          {speaking ? (
            <>
              <p className="truncate text-sm text-slate-200">“{speaking}”</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {progress!.index + 1} of {progress!.total}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              {count === 0
                ? 'Add an affirmation to begin.'
                : `${count} affirmation${count === 1 ? '' : 's'} ready.`}
            </p>
          )}
        </div>
      </div>

      {!supported && (
        <p className="mt-2 text-center text-xs text-rose">
          Text-to-speech isn’t available in this browser — playback is disabled.
        </p>
      )}
    </div>
  )
}
