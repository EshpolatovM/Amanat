import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import BottomTabBarChild from '../components/navigation/BottomTabBarChild'
import SidebarChild from '../components/navigation/SidebarChild'
import ScrollToTop from '../components/navigation/ScrollToTop'
import { LoadingState } from '../components/ui/States'

export default function ChildLayout() {
  return (
    <div className="min-h-dvh bg-paper">
      <ScrollToTop />
      <SidebarChild />
      <main className="px-3 pt-4 pb-[calc(8rem+env(safe-area-inset-bottom))] sm:px-4 sm:pt-6 lg:pb-10 lg:pl-72 lg:pr-8">
        <div className="mx-auto max-w-2xl rounded-[2rem] border-2 border-bronze/30 bg-card p-4 shadow-lg sm:p-6 lg:mx-0 lg:max-w-none lg:p-8">
          <Suspense fallback={<LoadingState />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      <BottomTabBarChild />
    </div>
  )
}
