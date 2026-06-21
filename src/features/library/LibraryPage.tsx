import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CATEGORIES,
  EVIDENCE_TIERS,
  LIBRARY,
  type CategoryFilter,
  type CategoryInfo,
  type EvidenceTier,
  type FrequencyEntry,
  categoryInfo,
  crossRefsFor,
  formatHz,
  loadTargets,
  searchLibrary,
} from '../../data/library'
import { useGenerator } from '../../state/generatorStore'
import { useLibrary } from '../../state/libraryStore'

const CATEGORY_FILTERS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  ...CATEGORIES.map((c) => ({ id: c.id as CategoryFilter, label: `${c.icon} ${c.name}` })),
  { id: 'bookmarked', label: '★ Saved' },
]

function TierTag({ tier }: { tier: EvidenceTier }) {
  const info = EVIDENCE_TIERS[tier]
  return (
    <span
      className="pill ring-1 ring-inset"
      style={{
        backgroundColor: `${info.hex}1f`,
        color: info.hex,
        boxShadow: `inset 0 0 0 1px ${info.hex}55`,
      }}
    >
      {info.short}
    </span>
  )
}

function CategoryTheory({ info }: { info: CategoryInfo }) {
  return (
    <div className="card space-y-2 p-5">
      <h2 className="font-display text-lg font-semibold text-white">
        {info.icon} {info.name}
      </h2>
      <p className="text-sm italic text-slate-400">{info.tagline}</p>
      <p className="text-sm leading-relaxed text-slate-300">{info.theory}</p>
      {info.caution && (
        <p className="rounded-lg bg-ember/5 px-3 py-2 text-xs leading-relaxed text-ember ring-1 ring-inset ring-ember/15">
          ⚠️ {info.caution}
        </p>
      )}
    </div>
  )
}

function EntryCard({ entry }: { entry: FrequencyEntry }) {
  const navigate = useNavigate()
  const bookmarked = useLibrary((s) => s.bookmarks.includes(entry.id))
  const toggleBookmark = useLibrary((s) => s.toggleBookmark)

  const targets = loadTargets(entry.hz)
  const refs = crossRefsFor(entry)
  const cat = categoryInfo(entry.category)

  const loadCarrier = () => {
    useGenerator.getState().setConfig({ carrierHz: entry.hz })
    navigate('/generator')
  }
  const loadBeat = () => {
    useGenerator.getState().selectBeat(entry.hz)
    navigate('/generator')
  }

  return (
    <div className="card flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-mono text-lg text-white">{formatHz(entry.hz)}</div>
          <div className="text-sm text-slate-300">{entry.name}</div>
        </div>
        <button
          type="button"
          onClick={() => toggleBookmark(entry.id)}
          aria-pressed={bookmarked}
          aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          className={[
            'text-lg leading-none transition-colors',
            bookmarked ? 'text-ember' : 'text-slate-600 hover:text-slate-300',
          ].join(' ')}
        >
          {bookmarked ? '★' : '☆'}
        </button>
      </div>

      <p className="flex-1 text-sm leading-relaxed text-slate-400">
        {entry.association}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        <TierTag tier={entry.tier} />
        <span className="pill bg-white/5 text-slate-400">
          {cat.icon} {cat.name}
        </span>
      </div>

      {refs.length > 0 && (
        <p className="text-xs text-slate-500">
          Also appears in{' '}
          {refs.map((r) => categoryInfo(r.category).name).join(', ')}
        </p>
      )}

      <div className="flex flex-wrap gap-2 border-t border-white/5 pt-3">
        {targets.carrier && (
          <button type="button" className="btn-ghost px-2.5 py-1 text-xs" onClick={loadCarrier}>
            → Carrier
          </button>
        )}
        {targets.beat && (
          <button type="button" className="btn-ghost px-2.5 py-1 text-xs" onClick={loadBeat}>
            → Beat
          </button>
        )}
        {!targets.carrier && !targets.beat && (
          <span className="text-xs text-slate-600">Reference only (outside audio range)</span>
        )}
      </div>
    </div>
  )
}

export function LibraryPage() {
  const [text, setText] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const bookmarks = useLibrary((s) => s.bookmarks)

  const results = useMemo(
    () => searchLibrary(LIBRARY, { text, category, bookmarks }),
    [text, category, bookmarks],
  )

  const activeCategory =
    category !== 'all' && category !== 'bookmarked' ? categoryInfo(category) : null

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold text-white">
          Frequency Library
        </h1>
        <p className="text-sm text-slate-400">
          A browsable reference across traditions and disciplines. Every entry is
          tagged with an honest evidence tier — and loads straight into the
          generator.
        </p>
      </header>

      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search by keyword (sleep, liver, fear…) or Hz value (528)"
        aria-label="Search the frequency library"
        className="w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm text-slate-100 outline-none ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:ring-violet/60"
      />

      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_FILTERS.map((c) => {
          const active = c.id === category
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={[
                'pill ring-1 ring-inset transition-colors',
                active
                  ? 'bg-violet/20 text-white ring-violet/60'
                  : 'bg-white/5 text-slate-300 ring-white/5 hover:bg-white/10',
              ].join(' ')}
            >
              {c.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500">
        <span className="label">Evidence:</span>
        {Object.entries(EVIDENCE_TIERS).map(([id, info]) => (
          <span key={id} className="inline-flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: info.hex }}
            />
            {info.label}
          </span>
        ))}
      </div>

      {activeCategory && <CategoryTheory info={activeCategory} />}

      <p className="text-xs text-slate-500">
        {results.length} {results.length === 1 ? 'entry' : 'entries'}
      </p>

      {results.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-500">
          {category === 'bookmarked'
            ? 'No bookmarks yet — tap ☆ on any entry to save it here.'
            : 'No frequencies match your search.'}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
