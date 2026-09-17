import { createBrowserRouter } from 'react-router-dom'
import ParentLayout from './layouts/ParentLayout'
import ChildLayout from './layouts/ChildLayout'
import RequireAuth from './components/auth/RequireAuth'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ParentDashboard from './pages/parent/Dashboard'
import ParentExpenses from './pages/parent/Expenses'
import ParentStatistics from './pages/parent/Statistics'
import ParentProfile from './pages/parent/Profile'
import ParentHelp from './pages/parent/Help'
import ChildDashboard from './pages/child/Dashboard'
import ChildExpenses from './pages/child/Expenses'
import ChildProfile from './pages/child/Profile'

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
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
])
