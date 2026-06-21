import { LIMITS } from '../../audio/types'
import { Slider } from '../../components/ui/Slider'
import { Toggle } from '../../components/ui/Toggle'
import { bandForBeat } from '../../data/brainwaves'
import { useGenerator } from '../../state/generatorStore'

/** Frequency ramp — glide the beat from its start value to a target over time. */
export function RampPanel() {
  const beatHz = useGenerator((s) => s.config.beatHz)
  const ramp = useGenerator((s) => s.config.ramp)
  const setRamp = useGenerator((s) => s.setRamp)

  const fromBand = bandForBeat(beatHz)?.name ?? 'start'
  const toBand = bandForBeat(ramp.targetBeatHz)?.name ?? 'target'
  const minutes = Math.round(ramp.durationSec / 60)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-200">Frequency ramp</p>
          <p className="text-xs text-slate-500">
            Guide the brain down progressively, e.g. Alpha → Theta.
          </p>
        </div>
        <Toggle
          label="Enable frequency ramp"
          checked={ramp.enabled}
          onChange={(enabled) => setRamp({ enabled })}
        />
      </div>

      {ramp.enabled && (
        <div className="space-y-4 border-t border-white/5 pt-4">
          <Slider
            label="Target beat"
            value={ramp.targetBeatHz}
            min={LIMITS.beatHz.min}
            max={LIMITS.beatHz.max}
            step={0.1}
            precision={1}
            unit="Hz"
            onChange={(v) => setRamp({ targetBeatHz: v })}
          />
          <Slider
            label="Ramp duration"
            value={minutes}
            min={1}
            max={120}
            step={1}
            unit="min"
            onChange={(v) => setRamp({ durationSec: v * 60 })}
          />
          <p className="text-xs leading-relaxed text-slate-500">
            Glides from{' '}
            <span className="font-mono text-slate-300">{beatHz.toFixed(1)} Hz</span>{' '}
            ({fromBand}) to{' '}
            <span className="font-mono text-slate-300">
              {ramp.targetBeatHz.toFixed(1)} Hz
            </span>{' '}
            ({toBand}) over {minutes} min. Takes effect on the next play.
          </p>
        </div>
      )}
    </div>
  )
}
