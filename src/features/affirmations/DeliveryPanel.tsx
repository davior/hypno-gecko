import {
  DELIVERY_LIMITS,
  SEQUENCING_INFO,
  type Sequencing,
} from '../../affirmations/types'
import { Segmented } from '../../components/ui/Segmented'
import { Slider } from '../../components/ui/Slider'
import { useAffirmations } from '../../state/affirmationStore'
import { TtsEnginePanel } from './TtsEnginePanel'

export function DeliveryPanel({
  voices,
  browserSupported,
  voicesChecked,
}: {
  voices: SpeechSynthesisVoice[]
  browserSupported: boolean
  voicesChecked: boolean
}) {
  const delivery = useAffirmations((s) => s.delivery)
  const setDelivery = useAffirmations((s) => s.setDelivery)
  const engine = useAffirmations((s) => s.tts.engine)

  return (
    <div className="space-y-5">
      <Slider
        label="Repetitions"
        value={delivery.repetitions}
        min={DELIVERY_LIMITS.repetitions.min}
        max={DELIVERY_LIMITS.repetitions.max}
        step={1}
        unit="× each"
        hint="How many times each affirmation plays per session."
        onChange={(v) => setDelivery({ repetitions: Math.round(v) })}
      />

      <div className="space-y-2">
        <p className="label">Sequencing</p>
        <Segmented<Sequencing>
          ariaLabel="Sequencing"
          columns={3}
          value={delivery.sequencing}
          onChange={(sequencing) => setDelivery({ sequencing })}
          options={(Object.keys(SEQUENCING_INFO) as Sequencing[]).map((id) => ({
            value: id,
            label: SEQUENCING_INFO[id].label,
          }))}
        />
        <p className="text-xs text-slate-500">
          {SEQUENCING_INFO[delivery.sequencing].hint}
        </p>
      </div>

      <Slider
        label="Gap between statements"
        value={delivery.gapSec}
        min={DELIVERY_LIMITS.gapSec.min}
        max={DELIVERY_LIMITS.gapSec.max}
        step={0.5}
        precision={1}
        unit="s"
        onChange={(v) => setDelivery({ gapSec: v })}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Slider
          label="Rate"
          value={delivery.rate}
          min={DELIVERY_LIMITS.rate.min}
          max={DELIVERY_LIMITS.rate.max}
          step={0.05}
          precision={2}
          unit="×"
          onChange={(v) => setDelivery({ rate: v })}
        />
        <Slider
          label="Pitch"
          value={delivery.pitch}
          min={DELIVERY_LIMITS.pitch.min}
          max={DELIVERY_LIMITS.pitch.max}
          step={0.1}
          precision={1}
          onChange={(v) => setDelivery({ pitch: v })}
        />
        <Slider
          label="Volume"
          value={Math.round(delivery.volume * 100)}
          min={DELIVERY_LIMITS.volume.min * 100}
          max={DELIVERY_LIMITS.volume.max * 100}
          step={1}
          unit="%"
          onChange={(v) => setDelivery({ volume: v / 100 })}
        />
      </div>

      {engine === 'browser' && (
        <div className="space-y-1.5">
          <label className="label" htmlFor="voice-select">
            System voice
          </label>
          {browserSupported && voices.length > 0 ? (
            <select
              id="voice-select"
              value={delivery.voiceURI ?? ''}
              onChange={(e) => setDelivery({ voiceURI: e.target.value || null })}
              className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-inset ring-white/10 focus:ring-violet/60"
            >
              <option value="">System default</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          ) : (
            <p className="text-xs text-slate-500">
              {!browserSupported
                ? 'Text-to-speech isn’t available in this browser.'
                : voicesChecked
                  ? 'No system voices found (common in Firefox on Linux). Switch to Deepgram below.'
                  : 'Loading system voices…'}
            </p>
          )}
        </div>
      )}

      <TtsEnginePanel />
    </div>
  )
}
