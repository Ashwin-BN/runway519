import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { ToastContainer } from '../ui/Toast'
import { useToast } from '../../hooks/useToast'
import { createContext, useContext } from 'react'

// ── Toast context so any page can trigger toasts
export const ToastContext = createContext(null)
export const useAppToast = () => useContext(ToastContext)

export default function AppLayout() {
  const { toasts, dismiss, success, error, warning } = useToast()

  return (
    <ToastContext.Provider value={{ success, error, warning }}>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar — desktop */}
        <aside className="hidden md:flex">
          <Sidebar />
        </aside>

        {/* Main */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <main
            className="flex-1 overflow-y-auto pb-20 md:pb-6
                           px-4 md:px-6 pt-4"
          >
            <Outlet />
          </main>
        </div>

        {/* Bottom nav — mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
          <BottomNav />
        </nav>

        {/* Toast notifications */}
        <ToastContainer toasts={toasts} onDismiss={dismiss} />
      </div>
    </ToastContext.Provider>
  )
}
