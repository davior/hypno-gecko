import { LIMITS } from '../../audio/types'
import { Slider } from '../../components/ui/Slider'
import { useGenerator } from '../../state/generatorStore'

/** Method-specific controls (AM depth, isochronic duty cycle & edge softness). */
export function MethodParams() {
  const config = useGenerator((s) => s.config)
  const setConfig = useGenerator((s) => s.setConfig)

  if (config.method === 'am') {
    return (
      <Slider
        label="Modulation depth"
        value={config.modDepth * 100}
        min={LIMITS.modDepth.min * 100}
        max={LIMITS.modDepth.max * 100}
        step={1}
        unit="%"
        hint="How deeply the volume wavers — 100% fully silences the tone between peaks."
        onChange={(v) => setConfig({ modDepth: v / 100 })}
      />
    )
  }

  if (config.method === 'isochronic') {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <Slider
          label="Duty cycle"
          value={config.dutyCycle * 100}
          min={LIMITS.dutyCycle.min * 100}
          max={LIMITS.dutyCycle.max * 100}
          step={1}
          unit="%"
          hint="Share of each pulse the tone stays on."
          onChange={(v) => setConfig({ dutyCycle: v / 100 })}
        />
        <Slider
          label="Edge softness"
          value={config.gateRampMs}
          min={LIMITS.gateRampMs.min}
          max={LIMITS.gateRampMs.max}
          step={1}
          unit="ms"
          hint="0 = hard cut (clicky, sharpest); higher = gentle fade."
          onChange={(v) => setConfig({ gateRampMs: v })}
        />
      </div>
    )
  }

  return (
    <p className="text-sm text-slate-500">
      No extra parameters for this method — shape it with the carrier and beat
      controls.
    </p>
  )
}
