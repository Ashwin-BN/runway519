import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { ToastContainer } from '../ui/Toast'
import { useToast } from '../../hooks/useToast'
import { createContext, useContext } from 'react'
import { useTheme } from '../../context/ThemeContext'

export const ToastContext = createContext(null)
export const useAppToast = () => useContext(ToastContext)

export default function AppLayout() {
  const { toasts, dismiss, success, error, warning } = useToast()
  const { isDark } = useTheme()

  return (
    <ToastContext.Provider value={{ success, error, warning }}>
      <div
        className="flex overflow-hidden transition-colors duration-200"
        style={{
          backgroundColor: isDark ? '#0F1623' : '#F9FAFB',
          color: isDark ? '#F1F5F9' : '#111827',
          height: '100dvh',
          maxHeight: '100dvh',
        }}
      >
        {/* Sidebar — desktop only */}
        <aside className="hidden md:flex shrink-0">
          <Sidebar />
        </aside>

        {/* Main column */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <TopBar />
          <main
            className="flex-1 overflow-y-auto overflow-x-hidden
                       px-4 md:px-6 pt-4"
            style={{
              /*
                Bottom padding calculation:
                64px  = bottom nav height
                env() = iPhone home indicator (34px on Pro Max)
                16px  = extra breathing room so last card is fully visible
              */
              paddingBottom:
                'calc(64px + env(safe-area-inset-bottom, 0px) + 16px)',
            }}
          >
            <Outlet />
          </main>
        </div>

        {/* Bottom nav — mobile only */}
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 z-50"
          style={{
            backgroundColor: isDark ? '#1A2332' : '#ffffff',
            borderTop: isDark ? '1px solid #1E2D3D' : '1px solid #e5e7eb',
            /* Extend bg behind home indicator */
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          <BottomNav />
        </div>

        <ToastContainer toasts={toasts} onDismiss={dismiss} />
      </div>
    </ToastContext.Provider>
  )
}
