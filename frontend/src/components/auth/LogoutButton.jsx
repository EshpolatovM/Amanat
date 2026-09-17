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
        mt-6 h-14 w-full rounded-2xl border-b-4 border-red-800 bg-red-600 text-base font-bold text-white
        shadow-lg transition-all duration-100 ease-in-out
        hover:translate-y-0.5 hover:border-b-[3px]
        active:translate-y-1 active:border-b-0 active:shadow-none
      "
    >
      Tizimdan chiqish
    </button>
  )
}
