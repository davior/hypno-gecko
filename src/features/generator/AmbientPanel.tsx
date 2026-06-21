import type { NoiseType } from '../../audio/types'
import { AMBIENT_LIMITS } from '../../audio/types'
import { Segmented } from '../../components/ui/Segmented'
import { Slider } from '../../components/ui/Slider'
import { Toggle } from '../../components/ui/Toggle'
import { NOISE_TYPES } from '../../data/ambient'
import { useGenerator } from '../../state/generatorStore'

/** Ambient Sound Layer (Module 4) — coloured noise mixed beneath the beats. */
export function AmbientPanel() {
  const ambient = useGenerator((s) => s.ambient)
  const setAmbient = useGenerator((s) => s.setAmbient)

  const info = NOISE_TYPES.find((n) => n.id === ambient.type)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-200">Ambient noise</p>
          <p className="text-xs text-slate-500">
            An environmental bed under the beats. Toggle live, any time.
          </p>
        </div>
        <Toggle
          label="Enable ambient layer"
          checked={ambient.enabled}
          onChange={(enabled) => setAmbient({ enabled })}
        />
      </div>

      {ambient.enabled && (
        <div className="space-y-4 border-t border-white/5 pt-4">
          <Segmented<NoiseType>
            ariaLabel="Noise type"
            columns={3}
            value={ambient.type}
            onChange={(type) => setAmbient({ type })}
            options={NOISE_TYPES.map((n) => ({ value: n.id, label: n.name }))}
          />
          {info && <p className="text-xs text-slate-500">{info.blurb}</p>}

          <Slider
            label="Layer volume"
            value={Math.round(ambient.volume * 100)}
            min={AMBIENT_LIMITS.volume.min * 100}
            max={AMBIENT_LIMITS.volume.max * 100}
            step={1}
            unit="%"
            onChange={(v) => setAmbient({ volume: v / 100 })}
          />
          <Slider
            label="Tone"
            value={ambient.toneHz}
            min={AMBIENT_LIMITS.toneHz.min}
            max={AMBIENT_LIMITS.toneHz.max}
            step={100}
            unit="Hz"
            hint="Low-pass cutoff — lower is softer and more distant."
            onChange={(v) => setAmbient({ toneHz: v })}
          />
        </div>
      )}
    </div>
  )
}
