import { useAuth } from '../../context/AuthContext'
import { LogOut, User } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'

export default function TopBar() {
  const { profile, signOut } = useAuth()

  return (
    <header
      className="bg-white dark:bg-brand-surface border-b
                        border-gray-200 dark:border-brand-border
                        px-4 md:px-6 py-3 flex items-center
                        justify-between shrink-0 transition-colors"
    >
      {/* Logo — mobile only */}
      <div className="flex items-center gap-2 md:hidden">
        <img
          src="/icons/icon-192.png"
          alt="Runway-519"
          className="w-7 h-7 rounded-lg"
        />
        <div className="flex items-baseline gap-0.5">
          <span className="text-lg font-bold text-brand-teal">Runway</span>
          <span className="text-lg font-bold text-gray-800 dark:text-white">
            -519
          </span>
        </div>
      </div>

      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* User info */}
        <div
          className="flex items-center gap-2 text-sm text-gray-600
                        dark:text-gray-400"
        >
          <div
            className="w-7 h-7 rounded-full bg-teal-100 dark:bg-brand-border
                          flex items-center justify-center"
          >
            <User size={14} className="text-brand-teal" />
          </div>
          <span
            className="hidden sm:block font-medium
                           dark:text-gray-300"
          >
            {profile?.full_name ?? 'Associate'}
          </span>
          <span className="text-xs text-gray-400 capitalize hidden sm:block">
            · {profile?.role ?? 'associate'}
          </span>
        </div>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50
                     dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
