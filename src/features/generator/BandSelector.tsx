import { ACCENT_HEX, BRAINWAVE_BANDS, bandForBeat } from '../../data/brainwaves'
import { useGenerator } from '../../state/generatorStore'

export function BandSelector() {
  const beatHz = useGenerator((s) => s.config.beatHz)
  const selectBeat = useGenerator((s) => s.selectBeat)
  const active = bandForBeat(beatHz)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-1.5">
        {BRAINWAVE_BANDS.map((band) => {
          const isActive = active?.id === band.id
          const hex = ACCENT_HEX[band.accent]
          return (
            <button
              key={band.id}
              type="button"
              onClick={() => selectBeat(band.defaultBeat)}
              title={band.qualities}
              className="rounded-xl px-2 py-3 text-center transition hover:bg-white/5"
              style={
                isActive
                  ? { backgroundColor: `${hex}1f`, boxShadow: `inset 0 0 0 1.5px ${hex}` }
                  : { boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)' }
              }
            >
              <span className="block text-sm font-semibold" style={{ color: hex }}>
                {band.name}
              </span>
              <span className="mt-0.5 block font-mono text-[10px] text-slate-400">
                {band.range[0]}–{band.range[1]}
              </span>
            </button>
          )
        })}
      </div>
      {active && (
        <p className="text-sm leading-relaxed text-slate-400">
          <span className="font-medium text-slate-200">{active.name}:</span>{' '}
          {active.qualities}
        </p>
      )}
    </div>
  )
}
