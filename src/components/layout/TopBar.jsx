import { useAuth } from '../../context/AuthContext'
import { LogOut, User } from 'lucide-react'

export default function TopBar() {
  const { profile, signOut } = useAuth()

  return (
    <header
      className="bg-white border-b border-gray-200 px-4 md:px-6 
                        py-3 flex items-center justify-between shrink-0"
    >
      <div className="flex items-center gap-2 md:hidden">
        <span className="text-lg font-bold text-pink-600">Runway</span>
        <span className="text-lg font-bold text-gray-800">519</span>
      </div>

      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div
            className="w-7 h-7 rounded-full bg-pink-100 flex items-center 
                          justify-center"
          >
            <User size={14} className="text-pink-600" />
          </div>
          <span className="hidden sm:block font-medium">
            {profile?.full_name ?? 'Associate'}
          </span>
          <span className="text-xs text-gray-400 capitalize hidden sm:block">
            · {profile?.role ?? 'associate'}
          </span>
        </div>
        <button
          onClick={signOut}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 
                     rounded-lg transition-colors"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
