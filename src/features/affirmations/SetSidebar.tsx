import { useState } from 'react'
import { useAffirmations } from '../../state/affirmationStore'

export function SetSidebar() {
  const sets = useAffirmations((s) => s.sets)
  const activeSetId = useAffirmations((s) => s.activeSetId)
  const selectSet = useAffirmations((s) => s.selectSet)
  const createSet = useAffirmations((s) => s.createSet)
  const deleteSet = useAffirmations((s) => s.deleteSet)
  const [name, setName] = useState('')

  const add = () => {
    if (!name.trim()) return
    createSet(name)
    setName('')
  }

  return (
    <div className="card space-y-3 p-4">
      <h2 className="label">Libraries</h2>

      <ul className="space-y-1">
        {sets.map((s) => {
          const active = s.id === activeSetId
          return (
            <li key={s.id} className="group flex items-center gap-1">
              <button
                type="button"
                onClick={() => selectSet(s.id)}
                className={[
                  'flex-1 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  active
                    ? 'bg-violet/20 text-white ring-1 ring-inset ring-violet/50'
                    : 'text-slate-300 hover:bg-white/5',
                ].join(' ')}
              >
                <span className="block truncate font-medium">{s.name}</span>
                <span className="text-xs text-slate-500">
                  {s.affirmations.length}{' '}
                  {s.affirmations.length === 1 ? 'affirmation' : 'affirmations'}
                </span>
              </button>
              <button
                type="button"
                aria-label={`Delete ${s.name}`}
                onClick={() => {
                  if (window.confirm(`Delete "${s.name}"? This can't be undone.`)) {
                    deleteSet(s.id)
                  }
                }}
                className="rounded-md px-2 py-1 text-slate-600 opacity-0 transition hover:text-rose group-hover:opacity-100"
              >
                ✕
              </button>
            </li>
          )
        })}
      </ul>

      <div className="flex gap-1.5 border-t border-white/5 pt-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="New library…"
          aria-label="New library name"
          className="min-w-0 flex-1 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-100 outline-none ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:ring-violet/60"
        />
        <button type="button" onClick={add} className="btn-ghost px-3 py-1.5 text-sm">
          Add
        </button>
      </div>
    </div>
  )
}
