import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useAuthStore } from './store/authStore'

function App() {
  const bootstrap = useAuthStore((state) => state.bootstrap)
  const status = useAuthStore((state) => state.status)

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm font-semibold text-slate-700">Yuklanmoqda...</p>
      </div>
    )
  }

  return <RouterProvider router={router} />
}

export default App
