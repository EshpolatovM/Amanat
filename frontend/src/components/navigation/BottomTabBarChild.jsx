import { Link, useLocation } from 'react-router-dom'
import { Home, Wallet, Smile } from 'lucide-react'
import { isTabActive } from './isTabActive'

const TABS = [
  {
    to: '/child',
    label: 'Bosh sahifa',
    icon: Home,
    activeBg: 'bg-green-50',
    activeBorder: 'border-green-500',
    exact: true,
  },
  {
    to: '/child/expenses',
    label: 'Xarajatlarim',
    icon: Wallet,
    activeBg: 'bg-yellow-50',
    activeBorder: 'border-yellow-500',
  },
  { to: '/child/profile', label: 'Men', icon: Smile, activeBg: 'bg-blue-50', activeBorder: 'border-blue-400' },
]

export default function BottomTabBarChild() {
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed inset-x-4 z-40 mx-auto flex h-24 max-w-md items-center justify-around rounded-[2.5rem] border-4 border-green-200 bg-white px-4 shadow-lg lg:hidden"
      style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
    >
      {TABS.map(({ to, label, icon: Icon, activeBg, activeBorder, exact }) => {
        const active = isTabActive(pathname, to, exact)
        return (
          <Link key={to} to={to} className="flex flex-1 flex-col items-center gap-1" aria-current={active ? 'page' : undefined}>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all duration-100 ${
                active ? `${activeBg} ${activeBorder}` : 'border-slate-300 bg-white'
              }`}
            >
              <Icon className="h-6 w-6 text-slate-900" strokeWidth={2.5} />
            </div>
            <span className="text-xs font-bold text-slate-900">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
