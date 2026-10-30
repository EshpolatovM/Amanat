import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { homePathFor } from '../../lib/authRoutes'
import FullPageLoader from '../ui/FullPageLoader'

export default function RequireAuth({ role, children }) {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (status === 'idle' || status === 'loading') {
    return <FullPageLoader />
  }

  if (status === 'unauthenticated' || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (user.role !== role) {
    return <Navigate to={homePathFor(user.role)} replace />
  }

  return children
}
