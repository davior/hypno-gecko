export interface SegmentedOption<T extends string> {
  value: T
  label: string
  sub?: string
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  columns?: number
  ariaLabel?: string
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  columns = 4,
  ariaLabel,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid gap-1.5"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={[
              'rounded-xl px-3 py-2 text-center transition-colors',
              active
                ? 'bg-violet/20 text-white ring-1 ring-inset ring-violet/60'
                : 'bg-white/5 text-slate-300 ring-1 ring-inset ring-white/5 hover:bg-white/10',
            ].join(' ')}
          >
            <span className="block text-sm font-semibold">{opt.label}</span>
            {opt.sub && (
              <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-slate-400">
                {opt.sub}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
