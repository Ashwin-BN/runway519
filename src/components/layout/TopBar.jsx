import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import ThemeToggle from '../ui/ThemeToggle'
import LogoutModal from '../ui/LogoutModal'

export default function TopBar() {
  const { profile, signOut } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [showLogout, setShowLogout] = useState(false)

  const initials =
    profile?.full_name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? '?'

  async function handleConfirmLogout() {
    setShowLogout(false)
    await signOut()
  }

  return (
    <>
      <header
        className="border-b border-gray-200 dark:border-brand-border
             px-4 md:px-6 flex items-center justify-between
             shrink-0 transition-colors duration-200"
        style={{
          backgroundColor: isDark ? '#1A2332' : '#ffffff',
          paddingTop: 'max(12px, env(safe-area-inset-top, 12px))',
          paddingBottom: '12px',
        }}
      >
        {/* Logo — mobile only */}
        <div
          className="flex items-center gap-2 md:hidden cursor-pointer"
          onClick={() => navigate('/inventory')}
        >
          <img
            src="/icons/icon-192.png"
            alt="Runway-519"
            className="w-7 h-7 rounded-lg"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
          <div className="flex items-baseline gap-0.5">
            <span className="text-lg font-bold text-brand-teal">Runway</span>
            <span className="text-lg font-bold text-gray-800 dark:text-white">
              -519
            </span>
          </div>
        </div>

        <div className="hidden md:block" />

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <ThemeToggle />

          {/* Avatar — taps to profile */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 group"
            title="View profile"
          >
            {/* Avatar circle */}
            <div
              className="w-8 h-8 rounded-full overflow-hidden bg-brand-teal/10
                            border-2 border-transparent group-hover:border-brand-teal
                            transition-all duration-200 flex items-center
                            justify-center shrink-0"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-brand-teal">
                  {initials}
                </span>
              )}
            </div>

            {/* Name + role — hidden on small screens */}
            <div className="hidden sm:block text-left">
              <p
                className="text-xs font-semibold text-gray-700 dark:text-gray-200
                            leading-tight group-hover:text-brand-teal
                            transition-colors"
              >
                {profile?.full_name ?? 'Associate'}
              </p>
              <p className="text-[10px] text-gray-400 capitalize leading-tight">
                {profile?.role ?? 'associate'}
              </p>
            </div>
          </button>

          {/* Sign out trigger */}
          <button
            onClick={() => setShowLogout(true)}
            className="p-2 text-gray-400 hover:text-red-400
                       hover:bg-red-50 dark:hover:bg-red-900/20
                       rounded-xl transition-colors"
            title="Sign out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Logout modal */}
      {showLogout && (
        <LogoutModal
          userName={profile?.full_name}
          onConfirm={handleConfirmLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </>
  )
}
