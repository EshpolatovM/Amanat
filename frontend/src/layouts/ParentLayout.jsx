import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import BottomTabBar from '../components/navigation/BottomTabBar'
import Sidebar from '../components/navigation/Sidebar'
import ScrollToTop from '../components/navigation/ScrollToTop'
import { LoadingState } from '../components/ui/States'

export default function ParentLayout() {
  return (
    <div className="min-h-dvh bg-paper">
      <ScrollToTop />
      <Sidebar />
      <main className="px-3 pt-4 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:px-4 sm:pt-6 lg:pb-10 lg:pl-80 lg:pr-8">
        <div className="mx-auto max-w-2xl rounded-3xl border-2 border-line bg-card p-4 shadow-lg sm:p-6 lg:mx-0 lg:max-w-none lg:p-8">
          <Suspense fallback={<LoadingState />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      <BottomTabBar />
    </div>
  )
}
