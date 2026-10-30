import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { postLoginPath } from '../../lib/authRoutes'

// Login/ro'yxatdan o'tish sahifalari faqat kirmagan foydalanuvchi uchun —
// kirgan bo'lsa (yoki hozirgina kirgan bo'lsa) o'z bo'limiga yo'naltiriladi.
export default function GuestOnly({ children }) {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (status === 'authenticated' && user) {
    return <Navigate to={postLoginPath(user.role, location.state?.from?.pathname)} replace />
  }
  return children
}
