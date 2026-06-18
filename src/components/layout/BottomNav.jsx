import { NavLink } from 'react-router-dom'
import { LayoutGrid, PlusCircle, BarChart2, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/inventory', icon: LayoutGrid, label: 'Inventory' },
  { to: '/inventory/add', icon: PlusCircle, label: 'Add Item' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
]

export default function BottomNav() {
  const { isAdmin } = useAuth()

  const items = isAdmin
    ? [...navItems, { to: '/users', icon: Users, label: 'Users' }]
    : navItems

  return (
    <div className="flex items-center justify-around px-1 py-2">
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 rounded-xl transition-colors
         min-w-[60px] min-h-[44px] justify-center px-2
         ${
           isActive
             ? 'text-brand-teal bg-brand-teal/10'
             : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
         }`
          }
        >
          <Icon size={20} />
          <span className="text-[11px] font-medium leading-none">{label}</span>
        </NavLink>
      ))}
    </div>
  )
}
