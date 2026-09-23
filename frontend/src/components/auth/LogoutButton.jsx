import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function LogoutButton() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="
        mt-6 h-14 w-full rounded-2xl border-b-2 border-alert-dark bg-alert text-base font-bold text-white
        shadow-lg transition-all duration-100 ease-in-out
        hover:translate-y-px hover:border-b-px
        active:translate-y-0.5 active:border-b-0 active:shadow-none
      "
    >
      Tizimdan chiqish
    </button>
  )
}
