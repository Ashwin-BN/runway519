import { NavLink } from 'react-router-dom'
import { LayoutGrid, PlusCircle, BarChart2, Users, Tag } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/inventory', icon: LayoutGrid, label: 'Inventory' },
  { to: '/inventory/add', icon: PlusCircle, label: 'Add Item' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
]

export default function Sidebar() {
  const { isAdmin } = useAuth()

  const items = isAdmin
    ? [...navItems, { to: '/users', icon: Users, label: 'Users' }]
    : navItems

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 bg-pink-600 rounded-lg flex items-center 
                          justify-center"
          >
            <Tag size={16} className="text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-pink-600">Runway</span>
            <span className="text-base font-bold text-gray-800">-519</span>
          </div>
        </div>
      </div>

      {/* Nav items */}
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
                   ? 'bg-pink-50 text-pink-600'
                   : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
               }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Version tag */}
      <div className="px-6 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">Runway-519 v1.0</p>
      </div>
    </div>
  )
}
