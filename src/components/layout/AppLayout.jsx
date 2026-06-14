import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { ToastContainer } from '../ui/Toast'
import { useToast } from '../../hooks/useToast'
import { createContext, useContext } from 'react'

export const ToastContext = createContext(null)
export const useAppToast = () => useContext(ToastContext)

export default function AppLayout() {
  const { toasts, dismiss, success, error, warning } = useToast()

  return (
    <ToastContext.Provider value={{ success, error, warning }}>
      <div
        className="flex h-screen overflow-hidden"
        style={{ backgroundColor: 'var(--page-bg)' }}
      >
        {/* Sidebar — desktop only */}
        <aside className="hidden md:flex">
          <Sidebar />
        </aside>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <main
            className="flex-1 overflow-y-auto pb-20 md:pb-6
                           px-4 md:px-6 pt-4"
          >
            <Outlet />
          </main>
        </div>

        {/* Bottom nav — mobile only, always visible */}
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 z-50
                      border-t"
          style={{
            backgroundColor: 'var(--nav-bg)',
            borderColor: 'var(--nav-border)',
          }}
        >
          <BottomNav />
        </div>

        <ToastContainer toasts={toasts} onDismiss={dismiss} />
      </div>
    </ToastContext.Provider>
  )
}
