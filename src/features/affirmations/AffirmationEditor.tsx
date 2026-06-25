import { useRef, useState } from 'react'
import { parseAffirmations, type ImportFormat } from '../../affirmations/parse'
import { DELIVERY_LIMITS } from '../../affirmations/types'
import { useAffirmations } from '../../state/affirmationStore'

function TagEditor({ setId, tags }: { setId: string; tags: string[] }) {
  const setTags = useAffirmations((s) => s.setTags)
  const [draft, setDraft] = useState('')

  const addTag = () => {
    const t = draft.trim().toLowerCase()
    if (t && !tags.includes(t)) setTags(setId, [...tags, t])
    setDraft('')
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((t) => (
        <span key={t} className="pill bg-white/5 text-slate-300">
          #{t}
          <button
            type="button"
            aria-label={`Remove tag ${t}`}
            onClick={() => setTags(setId, tags.filter((x) => x !== t))}
            className="text-slate-500 hover:text-rose"
          >
            ✕
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && addTag()}
        placeholder="add tag…"
        aria-label="Add tag"
        className="w-24 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-100 outline-none ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:ring-violet/60"
      />
    </div>
  )
}

export function AffirmationEditor() {
  const sets = useAffirmations((s) => s.sets)
  const activeSetId = useAffirmations((s) => s.activeSetId)
  const renameSet = useAffirmations((s) => s.renameSet)
  const addAffirmation = useAffirmations((s) => s.addAffirmation)
  const updateAffirmation = useAffirmations((s) => s.updateAffirmation)
  const deleteAffirmation = useAffirmations((s) => s.deleteAffirmation)
  const importToSet = useAffirmations((s) => s.importToSet)

  const [draft, setDraft] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const activeSet = sets.find((s) => s.id === activeSetId) ?? sets[0]

  if (!activeSet) {
    return (
      <div className="card p-8 text-center text-sm text-slate-500">
        Create a library on the left to begin.
      </div>
    )
  }

  const add = () => {
    if (!draft.trim()) return
    addAffirmation(activeSet.id, draft)
    setDraft('')
  }

  const onFile = (file: File) => {
    const format: ImportFormat = file.name.toLowerCase().endsWith('.csv')
      ? 'csv'
      : 'txt'
    const reader = new FileReader()
    reader.onload = () => {
      const parsed = parseAffirmations(String(reader.result ?? ''), format)
      importToSet(activeSet.id, parsed)
    }
    reader.readAsText(file)
  }

  return (
    <div className="card space-y-4 p-5">
      <div className="space-y-2">
        <input
          value={activeSet.name}
          onChange={(e) => renameSet(activeSet.id, e.target.value)}
          aria-label="Library name"
          className="w-full bg-transparent font-display text-xl font-bold text-white outline-none"
        />
        <TagEditor setId={activeSet.id} tags={activeSet.tags} />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) add()
          }}
          rows={2}
          placeholder="Write an affirmation… (⌘/Ctrl+Enter to add)"
          className="flex-1 resize-y rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:ring-violet/60"
        />
        <div className="flex gap-2 sm:flex-col">
          <button type="button" onClick={add} className="btn-ghost flex-1 text-sm">
            Add
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="btn-ghost flex-1 text-sm"
            title="Import from .txt or .csv"
          >
            Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onFile(file)
              e.target.value = ''
            }}
          />
        </div>
      </div>

      {activeSet.affirmations.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          No affirmations yet. Write one above or import a list.
        </p>
      ) : (
        <ul className="space-y-2">
          {activeSet.affirmations.map((a) => (
            <li
              key={a.id}
              className="flex items-start gap-2 rounded-xl bg-white/5 p-2 ring-1 ring-inset ring-white/5"
            >
              <textarea
                value={a.text}
                onChange={(e) =>
                  updateAffirmation(activeSet.id, a.id, { text: e.target.value })
                }
                rows={1}
                aria-label="Affirmation text"
                className="min-h-[2.25rem] flex-1 resize-y bg-transparent px-1 py-1.5 text-sm text-slate-200 outline-none"
              />
              <label className="flex items-center gap-1 text-xs text-slate-500">
                <span className="hidden sm:inline">wt</span>
                <input
                  type="number"
                  value={a.weight}
                  min={DELIVERY_LIMITS.weight.min}
                  max={DELIVERY_LIMITS.weight.max}
                  onChange={(e) =>
                    updateAffirmation(activeSet.id, a.id, {
                      weight: Math.max(
                        DELIVERY_LIMITS.weight.min,
                        Math.min(
                          DELIVERY_LIMITS.weight.max,
                          Math.round(Number.parseFloat(e.target.value) || 1),
                        ),
                      ),
                    })
                  }
                  aria-label="Weight"
                  className="w-12 rounded-md bg-white/5 px-1.5 py-1 text-center font-mono text-slate-200 outline-none ring-1 ring-inset ring-white/10 focus:ring-violet/60"
                />
              </label>
              <button
                type="button"
                aria-label="Delete affirmation"
                onClick={() => deleteAffirmation(activeSet.id, a.id)}
                className="rounded-md px-2 py-1.5 text-slate-600 transition hover:text-rose"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
