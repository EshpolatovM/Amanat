import { Outlet } from 'react-router-dom'
import BottomTabBarChild from '../components/navigation/BottomTabBarChild'
import SidebarChild from '../components/navigation/SidebarChild'

export default function ChildLayout() {
  return (
    <div className="min-h-screen bg-paper">
      <SidebarChild />
      <main className="px-4 pb-28 pt-6 lg:pb-10 lg:pl-72 lg:pr-8">
        <div className="mx-auto max-w-2xl rounded-[2rem] border-2 border-bronze/30 bg-card p-6 shadow-lg lg:mx-0 lg:max-w-none lg:p-8">
          <Outlet />
        </div>
      </main>
      <BottomTabBarChild />
    </div>
  )
}
