import { NavLink } from 'react-router-dom'
import { LayoutGrid, PlusCircle, BarChart2, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../ui/ThemeToggle'

const navItems = [
  { to: '/inventory', icon: LayoutGrid, label: 'Inventory' },
  { to: '/inventory/add', icon: PlusCircle, label: 'Add Item' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
]

export default function Sidebar() {
  const { isAdmin, profile, signOut } = useAuth()

  const items = isAdmin
    ? [...navItems, { to: '/users', icon: Users, label: 'Users' }]
    : navItems

  return (
    <div
      className="w-60 bg-white dark:bg-brand-surface border-r
                    border-gray-200 dark:border-brand-border
                    flex flex-col h-full transition-colors"
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 dark:border-brand-border">
        <div className="flex items-center gap-3">
          <img
            src="/icons/icon-192.png"
            alt="Runway-519"
            className="w-9 h-9 rounded-xl shadow-sm"
          />
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-base font-bold text-brand-teal">
                Runway
              </span>
              <span
                className="text-base font-bold text-gray-800
                               dark:text-white"
              >
                -519
              </span>
            </div>
            <p
              className="text-[10px] text-gray-400 dark:text-gray-500
                          leading-tight mt-0.5"
            >
              See More. Sell Smarter.
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
               font-medium transition-colors
               ${
                 isActive
                   ? 'bg-brand-teal/10 text-brand-teal'
                   : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-brand-border hover:text-gray-800 dark:hover:text-white'
               }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom — theme + user */}
      <div
        className="px-4 py-4 border-t border-gray-100 dark:border-brand-border
                      space-y-3"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {profile?.role ?? 'associate'}
          </span>
          <ThemeToggle />
        </div>
        <p className="text-[10px] text-gray-300 dark:text-gray-600">
          Runway-519 v1.0
        </p>
      </div>
    </div>
  )
}
