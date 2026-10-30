import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Wallet, BarChart3, User, Plus, HelpCircle } from 'lucide-react'
import QuickAddExpenseModal from './QuickAddExpenseModal'
import { isTabActive } from './isTabActive'
import { getAccent } from './accentTheme'
import { useAuthStore } from '../../store/authStore'
import Avatar from '../profile/Avatar'

const TABS = [
  { to: '/', label: 'Bosh sahifa', icon: Home, exact: true },
  { to: '/expenses', label: 'Xarajatlar', icon: Wallet },
  { to: '/statistics', label: 'Statistika', icon: BarChart3 },
  { to: '/profile', label: 'Profil', icon: User },
  { to: '/help', label: 'Yordam', icon: HelpCircle },
]

// `status`: 'good' (byudjet normal, yashil) yoki 'over' (limitdan oshgan, qizil).
// Backend'dan oylik xarajat holati kelganda shu prop orqali uzatiladi, hozircha default 'good'.
//
// Matn va ikonkalar odatdagidan kattaroq — asosiy auditoriya ota-onalar,
// ko'pchiligi katta yoshda va kichik shriftni qiyin o'qiydi (Accessibility First).
export default function Sidebar({ status = 'good' }) {
  const { pathname } = useLocation()
  const [isModalOpen, setModalOpen] = useState(false)
  const user = useAuthStore((state) => state.user)
  const accent = getAccent(status)

  return (
    <>
      <aside className="fixed inset-y-4 left-4 z-40 hidden w-72 flex-col rounded-[2rem] border-2 border-line bg-card px-4 py-8 shadow-lg lg:flex">
        <span className="mb-8 px-2 font-serif text-2xl font-semibold text-ink">Amanat</span>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={`
            mb-6 flex h-16 items-center justify-center gap-2 rounded-2xl
            border-b-2 ${accent.plusBorder} ${accent.plusBg} text-lg font-bold text-white
            shadow-lg transition-all duration-100 ease-in-out
            hover:translate-y-px hover:border-b
            active:translate-y-0.5 active:border-b-0 active:shadow-none
          `}
        >
          <Plus className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
          Xarajat qo'shish
        </button>

        <nav aria-label="Asosiy menyu" className="flex flex-1 flex-col gap-2">
          {TABS.map(({ to, label, icon: Icon, exact }) => {
            const active = isTabActive(pathname, to, exact)
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? `flex items-center gap-3 rounded-xl border-2 ${accent.activeBorder} ${accent.activeBg} px-4 py-4 text-base font-bold ${accent.text}`
                    : 'flex items-center gap-3 rounded-xl border-2 border-transparent px-4 py-4 text-base font-bold text-ink-soft hover:bg-paper'
                }
              >
                <Icon className="h-7 w-7" strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
                {label}
              </Link>
            )
          })}
        </nav>

        {user && (
          <Link to="/profile" className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-line px-3 py-3 hover:bg-paper">
            <Avatar firstName={user.firstName} lastName={user.lastName} size="sm" className="bg-forest text-white" />
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-ink">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm font-semibold text-ink-soft">Ota-ona</p>
            </div>
          </Link>
        )}
      </aside>

      {isModalOpen && <QuickAddExpenseModal onClose={() => setModalOpen(false)} />}
    </>
  )
}
