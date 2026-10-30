import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useAuthStore } from './store/authStore'
import Toaster from './components/ui/Toaster'
import FullPageLoader from './components/ui/FullPageLoader'

function App() {
  const bootstrap = useAuthStore((state) => state.bootstrap)
  const status = useAuthStore((state) => state.status)

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  if (status === 'idle' || status === 'loading') {
    return <FullPageLoader />
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}

export default App
