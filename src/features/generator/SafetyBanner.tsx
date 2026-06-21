import { Link } from 'react-router-dom'

/** Responsible-use disclaimer (Enhancement #8 — Ethical Safeguards). */
export function SafetyBanner() {
  return (
    <div className="card flex items-start gap-3 bg-ember/5 px-4 py-3 text-sm ring-1 ring-inset ring-ember/15">
      <span aria-hidden className="mt-0.5 text-base">
        ⚠️
      </span>
      <p className="leading-relaxed text-slate-300">
        For personal exploration and wellness —{' '}
        <strong className="font-semibold text-slate-100">
          not a medical device
        </strong>{' '}
        and not a treatment for any condition. Begin at a low volume. If you have
        epilepsy or a seizure disorder, a heart condition, or are pregnant,
        consult a professional before use. Don’t listen while driving.{' '}
        <Link
          to="/about"
          className="font-medium text-violet underline-offset-2 hover:underline"
        >
          Read more
        </Link>
        .
      </p>
    </div>
  )
}
