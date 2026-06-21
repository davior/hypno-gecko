import type { BeatMethod } from '../../audio/types'
import { Segmented } from '../../components/ui/Segmented'
import { BEAT_METHODS, methodInfo } from '../../data/methods'
import { useGenerator } from '../../state/generatorStore'

export function MethodSelector() {
  const method = useGenerator((s) => s.config.method)
  const setMethod = useGenerator((s) => s.setMethod)
  const info = methodInfo(method)

  return (
    <div className="space-y-3">
      <Segmented<BeatMethod>
        ariaLabel="Entrainment method"
        columns={4}
        value={method}
        onChange={setMethod}
        options={BEAT_METHODS.map((m) => ({
          value: m.id,
          label: m.name,
          sub: m.tagline.split(' · ')[0],
        }))}
      />
      <p className="text-sm leading-relaxed text-slate-400">{info.description}</p>
    </div>
  )
}
