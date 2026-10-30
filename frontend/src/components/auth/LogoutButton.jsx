import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import Button from '../ui/Button'

export default function LogoutButton() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const [pending, setPending] = useState(false)

  async function handleLogout() {
    setPending(true)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <Button variant="danger" onClick={handleLogout} loading={pending} fullWidth>
      <LogOut className="h-5 w-5" aria-hidden="true" />
      Tizimdan chiqish
    </Button>
  )
}
