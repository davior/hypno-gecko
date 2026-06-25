import { clamp } from '../../audio/beatMath'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  precision?: number
  hint?: string
  editable?: boolean
  onChange: (value: number) => void
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  precision = 0,
  hint,
  editable = true,
  onChange,
}: SliderProps) {
  const display = value.toFixed(precision)

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className="label">{label}</label>
        <div className="flex items-baseline gap-1">
          {editable ? (
            <input
              type="number"
              aria-label={label}
              className="w-20 rounded-md bg-white/5 px-2 py-0.5 text-right font-mono text-sm text-slate-100 outline-none ring-1 ring-inset ring-white/10 focus:ring-violet/60"
              value={display}
              min={min}
              max={max}
              step={step}
              onChange={(e) => onChange(clamp(parseFloat(e.target.value), min, max))}
            />
          ) : (
            <span className="font-mono text-sm text-slate-100">{display}</span>
          )}
          {unit && <span className="text-xs text-slate-500">{unit}</span>}
        </div>
      </div>
      <input
        type="range"
        aria-label={`${label} slider`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      {hint && <p className="text-xs leading-relaxed text-slate-500">{hint}</p>}
    </div>
  )
}
