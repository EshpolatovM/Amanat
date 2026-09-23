import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Wallet, BarChart3, User, Plus } from 'lucide-react'
import QuickAddExpenseModal from './QuickAddExpenseModal'
import { isTabActive } from './isTabActive'
import { getAccent } from './accentTheme'

// Pastki menyu markazidagi "+" tugmasi atrofida muvozanat saqlash uchun
// har ikki tomonda 2 tadan tab bo'lishi shart (5-navi Yordam esa Profil
// sahifasi ichidan ochiladi — mobil/tabletda 2 va 3 taqsimot noqulay ko'rinardi).
const LEFT_TABS = [
  { to: '/', label: 'Bosh sahifa', icon: Home, exact: true },
  { to: '/expenses', label: 'Xarajatlar', icon: Wallet },
]

const RIGHT_TABS = [
  { to: '/statistics', label: 'Statistika', icon: BarChart3 },
  { to: '/profile', label: 'Profil', icon: User },
]

function TabLink({ to, label, icon: Icon, active, accent }) {
  return (
    <Link
      to={to}
      className="flex flex-1 flex-col items-center gap-1 px-2 py-1"
      aria-current={active ? 'page' : undefined}
    >
      <Icon
        className={active ? `h-6 w-6 ${accent.text}` : 'h-6 w-6 text-ink-soft'}
        strokeWidth={active ? 2.5 : 2}
      />
      <span className={active ? `text-xs font-semibold ${accent.text}` : 'text-xs font-semibold text-ink-soft'}>
        {label}
      </span>
      <span className={active ? `h-0.5 w-4 rounded-full ${accent.indicator}` : 'h-0.5 w-4 rounded-full bg-transparent'} />
    </Link>
  )
}

// `status`: 'good' (byudjet normal, forest) yoki 'over' (limitdan oshgan, alert).
// Backend'dan oylik xarajat holati kelganda shu prop orqali uzatiladi, hozircha default 'good'.
export default function BottomTabBar({ status = 'good' }) {
  const { pathname } = useLocation()
  const [isModalOpen, setModalOpen] = useState(false)
  const accent = getAccent(status)

  return (
    <>
      <nav
        className="fixed inset-x-4 z-40 mx-auto flex h-20 max-w-md items-center justify-around rounded-full border-2 border-line bg-card px-3 shadow-lg lg:hidden"
        style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        {LEFT_TABS.map((tab) => (
          <TabLink key={tab.to} {...tab} active={isTabActive(pathname, tab.to, tab.exact)} accent={accent} />
        ))}

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label="Tezkor xarajat qo'shish"
          className={`
            -mt-8 flex h-16 w-16 shrink-0 items-center justify-center rounded-full
            border-b-2 ${accent.plusBorder} ${accent.plusBg} text-white shadow-lg
            transition-all duration-100 ease-in-out
            hover:translate-y-px hover:border-b-px
            active:translate-y-0.5 active:border-b-0 active:shadow-none
          `}
        >
          <Plus className="h-8 w-8" strokeWidth={3} />
        </button>

        {RIGHT_TABS.map((tab) => (
          <TabLink key={tab.to} {...tab} active={isTabActive(pathname, tab.to, tab.exact)} accent={accent} />
        ))}
      </nav>

      <QuickAddExpenseModal open={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
