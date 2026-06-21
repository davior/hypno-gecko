import type { ReactNode } from 'react'
import { LIMITS } from '../../audio/types'
import { Slider } from '../../components/ui/Slider'
import { useGenerator } from '../../state/generatorStore'
import { BandSelector } from './BandSelector'
import { LiveVisual } from './LiveVisual'
import { MethodParams } from './MethodParams'
import { MethodSelector } from './MethodSelector'
import { PresetPanel } from './PresetPanel'
import { RampPanel } from './RampPanel'
import { SafetyBanner } from './SafetyBanner'
import { TransportBar } from './TransportBar'

function Panel({
  title,
  desc,
  children,
}: {
  title: string
  desc?: string
  children: ReactNode
}) {
  return (
    <section className="card space-y-4 p-5">
      <div>
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-slate-200">
          {title}
        </h2>
        {desc && <p className="mt-1 text-xs text-slate-500">{desc}</p>}
      </div>
      {children}
    </section>
  )
}

function CoreControls() {
  const carrierHz = useGenerator((s) => s.config.carrierHz)
  const beatHz = useGenerator((s) => s.config.beatHz)
  const setConfig = useGenerator((s) => s.setConfig)
  const selectBeat = useGenerator((s) => s.selectBeat)

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Slider
        label="Carrier"
        value={carrierHz}
        min={LIMITS.carrierHz.min}
        max={LIMITS.carrierHz.max}
        step={1}
        unit="Hz"
        hint="The audible tone you actually hear."
        onChange={(v) => setConfig({ carrierHz: v })}
      />
      <Slider
        label="Beat"
        value={beatHz}
        min={LIMITS.beatHz.min}
        max={LIMITS.beatHz.max}
        step={0.1}
        precision={2}
        unit="Hz"
        hint="The entrainment target — never heard directly."
        onChange={(v) => selectBeat(v)}
      />
    </div>
  )
}

export function GeneratorPage() {
  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold text-white">
          Frequency &amp; Beat Generator
        </h1>
        <p className="text-sm text-slate-400">
          The acoustic architecture of the altered state. Pick a target band,
          choose how it’s generated, and press play.
        </p>
      </header>

      <SafetyBanner />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <Panel
            title="Method"
            desc="How the beat is physically produced."
          >
            <MethodSelector />
          </Panel>

          <Panel
            title="Target band"
            desc="The brainwave state you're guiding toward."
          >
            <BandSelector />
          </Panel>

          <Panel title="Frequencies">
            <CoreControls />
            <div className="border-t border-white/5 pt-4">
              <MethodParams />
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Live">
            <LiveVisual />
          </Panel>

          <Panel title="Ramp">
            <RampPanel />
          </Panel>

          <Panel
            title="Presets"
            desc="Solfeggio & Schumann quick-loads."
          >
            <PresetPanel />
          </Panel>
        </div>
      </div>

      <TransportBar />
    </div>
  )
}
