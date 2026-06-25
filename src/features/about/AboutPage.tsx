import { BEAT_METHODS } from '../../data/methods'
import { BRAINWAVE_BANDS, ACCENT_HEX } from '../../data/brainwaves'

export function AboutPage() {
  return (
    <div className="prose-invert mx-auto max-w-2xl space-y-8">
      <section className="space-y-3">
        <h1 className="font-display text-2xl font-bold text-white">
          About Hypno Gecko
        </h1>
        <p className="leading-relaxed text-slate-300">
          A self-directed neuroacoustic tool that puts the architecture of
          consciousness alteration in your own hands. No therapist required, no
          gatekeeping — just the raw mechanics of brainwave entrainment, layered
          (in time) with personalized linguistic programming, through a clean,
          intuitive interface. The underlying premise: altered states are a
          technology, and that technology should be open and accessible.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-white">
          How entrainment works
        </h2>
        <p className="leading-relaxed text-slate-300">
          You hear an audible <em>carrier</em> tone. Embedded within it is a much
          slower <em>beat</em> — the frequency your brain is gently nudged
          toward. The four methods differ only in how that beat is produced:
        </p>
        <ul className="space-y-2">
          {BEAT_METHODS.map((m) => (
            <li key={m.id} className="text-sm leading-relaxed text-slate-300">
              <span className="font-semibold text-slate-100">{m.name}</span>{' '}
              <span className="text-slate-500">— {m.tagline}.</span>{' '}
              {m.description}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-white">
          Brainwave bands
        </h2>
        <div className="overflow-hidden rounded-xl ring-1 ring-inset ring-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2">Band</th>
                <th className="px-3 py-2">Range</th>
                <th className="px-3 py-2">Qualities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {BRAINWAVE_BANDS.map((b) => (
                <tr key={b.id}>
                  <td
                    className="px-3 py-2 font-semibold"
                    style={{ color: ACCENT_HEX[b.accent] }}
                  >
                    {b.name}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-400">
                    {b.range[0]}–{b.range[1]} Hz
                  </td>
                  <td className="px-3 py-2 text-slate-300">{b.qualities}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl bg-ember/5 p-5 ring-1 ring-inset ring-ember/15">
        <h2 className="font-display text-lg font-semibold text-white">
          Responsible use
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-300">
          <li>
            This is a wellness and exploration tool, <strong>not</strong> a
            medical device. It does not diagnose, treat, cure, or prevent any
            condition.
          </li>
          <li>
            Begin at a low volume and increase gradually. Prolonged exposure to
            loud tones can damage hearing.
          </li>
          <li>
            If you have epilepsy or a seizure disorder, a heart condition or
            pacemaker, or are pregnant, consult a qualified professional before
            using audio entrainment.
          </li>
          <li>
            Never use while driving or operating machinery — sessions are
            designed to induce deeply relaxed, drowsy states.
          </li>
          <li>
            Subliminal and reverse-speech techniques (a later phase) will always
            be explicit opt-in, with a plain explanation of what they do.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-white">Roadmap</h2>
        <p className="text-sm leading-relaxed text-slate-400">
          Phase 1 (here now) is the Frequency &amp; Beat Generator. Coming next:
          an ambient sound layer and browsable frequency library, an affirmation
          engine with text-to-speech, a DAW-style session builder with
          induction &amp; emergence sequences, and a session journal — building
          toward fully offline-capable, self-directed sessions.
        </p>
      </section>
    </div>
  )
}
