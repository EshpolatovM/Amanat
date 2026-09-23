import { Link, useLocation } from 'react-router-dom'
import { Home, Wallet, Smile } from 'lucide-react'
import { isTabActive } from './isTabActive'

const TABS = [
  {
    to: '/child',
    label: 'Bosh sahifa',
    icon: Home,
    activeBg: 'bg-forest-soft',
    activeBorder: 'border-forest',
    exact: true,
  },
  {
    to: '/child/expenses',
    label: 'Xarajatlarim',
    icon: Wallet,
    activeBg: 'bg-bronze-soft',
    activeBorder: 'border-bronze',
  },
  { to: '/child/profile', label: 'Men', icon: Smile, activeBg: 'bg-bronze-soft', activeBorder: 'border-bronze' },
]

export default function SidebarChild() {
  const { pathname } = useLocation()

  return (
    <aside className="fixed inset-y-4 left-4 z-40 hidden w-64 flex-col rounded-[2.5rem] border-4 border-bronze/30 bg-card px-4 py-8 shadow-lg lg:flex">
      <span className="mb-8 px-2 text-xl font-serif font-semibold text-ink">Amanat</span>

      <nav className="flex flex-1 flex-col gap-3">
        {TABS.map(({ to, label, icon: Icon, activeBg, activeBorder, exact }) => {
          const active = isTabActive(pathname, to, exact)
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? 'page' : undefined}
              className="flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-paper"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 transition-all duration-100 ${
                  active ? `${activeBg} ${activeBorder}` : 'border-line bg-card'
                }`}
              >
                <Icon className="h-6 w-6 text-ink" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-bold text-ink">{label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
