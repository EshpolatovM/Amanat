import { Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import ParentLayout from './layouts/ParentLayout'
import ChildLayout from './layouts/ChildLayout'
import RequireAuth from './components/auth/RequireAuth'
import GuestOnly from './components/auth/GuestOnly'
import FullPageLoader from './components/ui/FullPageLoader'
import NotFound from './pages/NotFound'
import RouteError from './pages/RouteError'
import {
  Login,
  Register,
  ForgotPassword,
  ParentDashboard,
  ParentExpenses,
  ParentStatistics,
  ParentProfile,
  ParentHelp,
  ChildDashboard,
  ChildExpenses,
  ChildProfile,
} from './pages/lazyPages'

function guest(page) {
  return (
    <GuestOnly>
      <Suspense fallback={<FullPageLoader />}>{page}</Suspense>
    </GuestOnly>
  )
}

export const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    children: [
      { path: '/login', element: guest(<Login />) },
      { path: '/register', element: guest(<Register />) },
      { path: '/forgot-password', element: guest(<ForgotPassword />) },
      {
        element: (
          <RequireAuth role="parent">
            <ParentLayout />
          </RequireAuth>
        ),
        children: [
          { path: '/', element: <ParentDashboard /> },
          { path: '/expenses', element: <ParentExpenses /> },
          { path: '/statistics', element: <ParentStatistics /> },
          { path: '/profile', element: <ParentProfile /> },
          { path: '/help', element: <ParentHelp /> },
        ],
      },
      {
        element: (
          <RequireAuth role="child">
            <ChildLayout />
          </RequireAuth>
        ),
        children: [
          { path: '/child', element: <ChildDashboard /> },
          { path: '/child/expenses', element: <ChildExpenses /> },
          { path: '/child/profile', element: <ChildProfile /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])
