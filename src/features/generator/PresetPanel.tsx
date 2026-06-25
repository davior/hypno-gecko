import type { FrequencyPreset } from '../../data/presets'
import { REFERENCE_CARRIERS, SCHUMANN, SOLFEGGIO } from '../../data/presets'
import { useGenerator } from '../../state/generatorStore'

function PresetRow({
  title,
  items,
  activeHz,
  onPick,
}: {
  title: string
  items: FrequencyPreset[]
  activeHz: number
  onPick: (hz: number) => void
}) {
  return (
    <div className="space-y-2">
      <p className="label">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => {
          const active = Math.abs(item.hz - activeHz) < 0.05
          return (
            <button
              key={item.hz}
              type="button"
              title={item.note}
              onClick={() => onPick(item.hz)}
              className={[
                'pill ring-1 ring-inset transition-colors',
                active
                  ? 'bg-violet/20 text-white ring-violet/60'
                  : 'bg-white/5 text-slate-300 ring-white/5 hover:bg-white/10',
              ].join(' ')}
            >
              {item.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Quick-access carrier and beat presets (Solfeggio, Schumann, reference). */
export function PresetPanel() {
  const carrierHz = useGenerator((s) => s.config.carrierHz)
  const beatHz = useGenerator((s) => s.config.beatHz)
  const setConfig = useGenerator((s) => s.setConfig)
  const selectBeat = useGenerator((s) => s.selectBeat)

  return (
    <div className="space-y-4">
      <PresetRow
        title="Solfeggio carriers"
        items={SOLFEGGIO}
        activeHz={carrierHz}
        onPick={(hz) => setConfig({ carrierHz: hz })}
      />
      <PresetRow
        title="Reference carriers"
        items={REFERENCE_CARRIERS}
        activeHz={carrierHz}
        onPick={(hz) => setConfig({ carrierHz: hz })}
      />
      <PresetRow
        title="Schumann beat targets"
        items={SCHUMANN}
        activeHz={beatHz}
        onPick={(hz) => selectBeat(hz)}
      />
    </div>
  )
}
