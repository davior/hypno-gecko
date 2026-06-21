import { ACCENT_HEX, bandForBeat } from '../../data/brainwaves'
import { useGenerator } from '../../state/generatorStore'

/**
 * A soft pulsing orb — a small taste of the Visual Entrainment Companion
 * (Enhancement #5). The pulse is a smooth scale capped at ~4 Hz (never a
 * high-contrast flash) to stay clear of photic-seizure territory.
 */
export function LiveVisual() {
  const playing = useGenerator((s) => s.engineState === 'playing')
  const beatHz = useGenerator((s) => s.config.beatHz)

  const band = bandForBeat(beatHz)
  const hex = band ? ACCENT_HEX[band.accent] : '#9b8cf0'
  const period = Math.max(1 / Math.max(beatHz, 0.5), 0.25)

  return (
    <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-2xl bg-night-950/40">
      <div
        className={playing ? 'animate-breathe' : ''}
        style={{
          width: 104,
          height: 104,
          borderRadius: '9999px',
          background: `radial-gradient(circle at 50% 40%, ${hex}, transparent 70%)`,
          boxShadow: `0 0 70px 12px ${hex}44`,
          animationDuration: `${period}s`,
          opacity: playing ? 1 : 0.35,
          transition: 'opacity 0.5s ease',
        }}
      />
      <span className="pointer-events-none absolute bottom-3 font-mono text-[11px] text-slate-500">
        {playing ? `pulsing · ${beatHz.toFixed(2)} Hz` : 'idle'}
      </span>
    </div>
  )
}
