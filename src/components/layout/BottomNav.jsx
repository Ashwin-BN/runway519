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
    <div
      className="bg-white border-t border-gray-200 flex items-center 
                    justify-around px-2 py-2 safe-area-pb"
    >
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl 
             transition-colors min-w-[60px]
             ${
               isActive
                 ? 'text-pink-600 bg-pink-50'
                 : 'text-gray-400 hover:text-gray-600'
             }`
          }
        >
          <Icon size={20} />
          <span className="text-[11px] font-medium">{label}</span>
        </NavLink>
      ))}
    </div>
  )
}
