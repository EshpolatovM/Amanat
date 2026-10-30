import { lazy } from 'react'

// Sahifalar alohida bo'laklarga (chunk) ajratiladi — masalan kirish sahifasi
// diagramma kutubxonasini (Recharts) yuklamaydi, mobil internetda tezroq ochiladi.
export const Login = lazy(() => import('./auth/Login'))
export const Register = lazy(() => import('./auth/Register'))
export const ForgotPassword = lazy(() => import('./auth/ForgotPassword'))
export const ParentDashboard = lazy(() => import('./parent/Dashboard'))
export const ParentExpenses = lazy(() => import('./parent/Expenses'))
export const ParentStatistics = lazy(() => import('./parent/Statistics'))
export const ParentProfile = lazy(() => import('./parent/Profile'))
export const ParentHelp = lazy(() => import('./parent/Help'))
export const ChildDashboard = lazy(() => import('./child/Dashboard'))
export const ChildExpenses = lazy(() => import('./child/Expenses'))
export const ChildProfile = lazy(() => import('./child/Profile'))
