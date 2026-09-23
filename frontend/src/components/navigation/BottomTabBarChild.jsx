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

export default function BottomTabBarChild() {
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed inset-x-4 z-40 mx-auto flex h-24 max-w-md items-center justify-around rounded-[2.5rem] border-4 border-bronze/30 bg-card px-4 shadow-lg lg:hidden"
      style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
    >
      {TABS.map(({ to, label, icon: Icon, activeBg, activeBorder, exact }) => {
        const active = isTabActive(pathname, to, exact)
        return (
          <Link key={to} to={to} className="flex flex-1 flex-col items-center gap-1" aria-current={active ? 'page' : undefined}>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all duration-100 ${
                active ? `${activeBg} ${activeBorder}` : 'border-line bg-card'
              }`}
            >
              <Icon className="h-6 w-6 text-ink" strokeWidth={2.5} />
            </div>
            <span className="text-xs font-bold text-ink">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
