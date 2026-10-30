import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { homePathFor } from '../lib/authRoutes'
import { buttonClassName } from '../components/ui/buttonStyles'

export default function NotFound() {
  const user = useAuthStore((state) => state.user)

  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-3xl border-2 border-line bg-card p-8 text-center shadow-lg">
        <h1 className="font-serif text-3xl font-semibold text-ink">Sahifa topilmadi</h1>
        <p className="mt-2 text-base font-semibold text-ink-soft">
          Bu manzilda sahifa yo'q. Havola eskirgan yoki xato yozilgan bo'lishi mumkin.
        </p>
        <Link to={user ? homePathFor(user.role) : '/login'} className={buttonClassName({ fullWidth: true, className: 'mt-6' })}>
          {user ? 'Bosh sahifaga qaytish' : 'Kirish sahifasiga'}
        </Link>
      </div>
    </main>
  )
}
