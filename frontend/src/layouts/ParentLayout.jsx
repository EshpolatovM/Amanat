import { Outlet } from 'react-router-dom'
import BottomTabBar from '../components/navigation/BottomTabBar'
import Sidebar from '../components/navigation/Sidebar'

export default function ParentLayout() {
  return (
    <div className="min-h-screen bg-paper">
      <Sidebar />
      <main className="px-4 pb-24 pt-6 lg:pb-10 lg:pl-80 lg:pr-8">
        <div className="mx-auto max-w-2xl rounded-3xl border-2 border-line bg-card p-6 shadow-lg lg:mx-0 lg:max-w-none lg:p-8">
          <Outlet />
        </div>
      </main>
      <BottomTabBar />
    </div>
  )
}
