import { buildTimeline, type PhaseKind } from '../../session/schedule'
import type { SessionConfig } from '../../session/types'
import { mmss } from '../../utils/time'

const PHASE_COLOR: Record<PhaseKind, string> = {
  induction: '#9b8cf0',
  main: '#6fd6e6',
  emergence: '#f6a657',
}

export function TimelineView({
  session,
  elapsedSec,
  playing,
}: {
  session: SessionConfig
  elapsedSec: number
  playing: boolean
}) {
  const { phases, totalSec } = buildTimeline(session)
  const pct = totalSec > 0 ? Math.min(100, (elapsedSec / totalSec) * 100) : 0

  return (
    <div className="space-y-2">
      <div className="relative flex h-12 overflow-hidden rounded-xl ring-1 ring-inset ring-white/10">
        {phases.map((p) => (
          <div
            key={p.kind}
            style={{
              width: `${(p.durationSec / totalSec) * 100}%`,
              backgroundColor: `${PHASE_COLOR[p.kind]}2a`,
            }}
            className="relative flex flex-col items-center justify-center gap-0.5 border-r border-white/10 last:border-r-0"
            title={`${p.label} · ${mmss(p.durationSec)}`}
          >
            <span
              className="text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: PHASE_COLOR[p.kind] }}
            >
              {p.label}
            </span>
            <span className="text-[10px] text-slate-400">{mmss(p.durationSec)}</span>
          </div>
        ))}
        {playing && (
          <div
            className="absolute top-0 h-full w-0.5 bg-white shadow"
            style={{ left: `${pct}%` }}
          />
        )}
      </div>
      <div className="flex justify-between font-mono text-xs text-slate-500">
        <span>{mmss(elapsedSec)}</span>
        <span>{mmss(totalSec)}</span>
      </div>
    </div>
  )
}
