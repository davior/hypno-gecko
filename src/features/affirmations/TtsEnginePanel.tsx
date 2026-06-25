import { DEEPGRAM_VOICES } from '../../affirmations/DeepgramSpeaker'
import type { TtsEngine } from '../../affirmations/types'
import { Segmented } from '../../components/ui/Segmented'
import { useAffirmations } from '../../state/affirmationStore'

/** Choose the text-to-speech engine: built-in browser voices or Deepgram. */
export function TtsEnginePanel() {
  const tts = useAffirmations((s) => s.tts)
  const setTts = useAffirmations((s) => s.setTts)

  return (
    <div className="space-y-3 border-t border-white/5 pt-4">
      <div className="space-y-2">
        <p className="label">Speech engine</p>
        <Segmented<TtsEngine>
          ariaLabel="Speech engine"
          columns={2}
          value={tts.engine}
          onChange={(engine) => setTts({ engine })}
          options={[
            { value: 'browser', label: 'Browser', sub: 'built-in' },
            { value: 'deepgram', label: 'Deepgram', sub: 'API key' },
          ]}
        />
      </div>

      {tts.engine === 'deepgram' && (
        <div className="space-y-3">
          <p className="text-xs leading-relaxed text-slate-400">
            Deepgram’s cloud voices work in any browser — useful when Firefox has
            no system voices. Affirmation text is sent to Deepgram to synthesise
            speech, so this needs an internet connection. Your key is stored only
            in this browser.{' '}
            <a
              href="https://console.deepgram.com/signup"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-violet underline-offset-2 hover:underline"
            >
              Get a free API key →
            </a>
          </p>

          <div className="space-y-1.5">
            <label className="label" htmlFor="dg-key">
              Deepgram API key
            </label>
            <input
              id="dg-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={tts.deepgramKey}
              onChange={(e) => setTts({ deepgramKey: e.target.value })}
              placeholder="paste your key…"
              className="w-full rounded-xl bg-white/5 px-3 py-2 font-mono text-sm text-slate-100 outline-none ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:ring-violet/60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="label" htmlFor="dg-voice">
              Voice
            </label>
            <select
              id="dg-voice"
              value={tts.deepgramModel}
              onChange={(e) => setTts({ deepgramModel: e.target.value })}
              className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-inset ring-white/10 focus:ring-violet/60"
            >
              {DEEPGRAM_VOICES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
