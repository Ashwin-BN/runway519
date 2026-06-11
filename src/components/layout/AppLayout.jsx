import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar — visible on md+ screens */}
      <aside className="hidden md:flex">
        <Sidebar />
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6 px-4 md:px-6 pt-4">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav — visible on mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </nav>
    </div>
  )
}
