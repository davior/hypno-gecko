import { NavLink, Outlet } from 'react-router-dom'

const NAV = [
  { to: '/generator', label: 'Generator' },
  { to: '/affirmations', label: 'Affirmations' },
  { to: '/library', label: 'Library' },
  { to: '/about', label: 'About' },
]

export function AppLayout() {
  return (
    <div className="mx-auto flex min-h-full max-w-5xl flex-col px-4 py-6 sm:px-6">
      <header className="mb-6 flex items-center justify-between">
        <NavLink to="/generator" className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            🦎
          </span>
          <span className="font-display text-lg font-bold text-white">
            Hypno Gecko
          </span>
        </NavLink>
        <nav className="flex items-center gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-slate-200',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-10 border-t border-white/5 pt-4 text-center text-xs text-slate-600">
        Hypno Gecko · self-directed neuroacoustics · for wellness &amp;
        exploration, not medical use
      </footer>
    </div>
  )
}
