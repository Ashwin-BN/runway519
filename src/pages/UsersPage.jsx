import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useUsers } from '../hooks/useUsers'
import { useNavigate } from 'react-router-dom'
import RoleBadge from '../components/ui/RoleBadge'
import Button from '../components/ui/Button'
import {
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  UserX,
  UserCheck,
  Info,
  X,
  Crown,
} from 'lucide-react'
import { format } from 'date-fns'

const ROLES = ['associate', 'markdown', 'supervisor', 'admin']

const ROLE_INFO = [
  {
    role: 'associate',
    icon: <Users size={16} />,
    color: 'gray',
    perms: ['View inventory', 'Add new items', 'View analytics'],
  },
  {
    role: 'markdown',
    icon: <Shield size={16} />,
    color: 'yellow',
    perms: [
      'All Associate permissions',
      'Change item prices',
      'Mark items as markdown / sold',
    ],
  },
  {
    role: 'supervisor',
    icon: <ShieldCheck size={16} />,
    color: 'blue',
    perms: [
      'All Markdown permissions',
      'Edit any item',
      'Delete items',
      'View full audit log',
    ],
  },
  {
    role: 'admin',
    icon: <ShieldAlert size={16} />,
    color: 'purple',
    perms: [
      'All Supervisor permissions',
      'Manage users & roles',
      'Suspend accounts',
      'Full system access',
    ],
  },
]

const COLOR_MAP = {
  gray: 'bg-gray-50 border-gray-200 text-gray-700',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
}

export default function UsersPage() {
  const navigate = useNavigate()
  const { isAdmin, user: currentUser } = useAuth()
  const { users, loading, error, fetchUsers, updateRole, toggleSuspend } =
    useUsers()

  const [showRoleInfo, setShowRoleInfo] = useState(false)
  const [changingRole, setChangingRole] = useState(null) // userId
  const [togglingUser, setTogglingUser] = useState(null) // userId
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!isAdmin) {
      navigate('/inventory')
      return
    }
    fetchUsers()
  }, [isAdmin])

  // ── Role change
  async function handleRoleChange(userId, newRole) {
    setChangingRole(userId)
    try {
      await updateRole(userId, newRole)
    } catch (err) {
      alert('Failed to update role: ' + err.message)
    } finally {
      setChangingRole(null)
    }
  }

  // ── Suspend toggle
  async function handleToggleSuspend(userId, suspended) {
    setTogglingUser(userId)
    try {
      await toggleSuspend(userId, suspended)
    } catch (err) {
      alert('Failed to update user: ' + err.message)
    } finally {
      setTogglingUser(null)
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    )
  })

  // Stats
  const roleCounts = ROLES.reduce((acc, r) => {
    acc[r] = users.filter((u) => u.role === r).length
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-8 h-8 border-4 border-pink-500 border-t-transparent
                        rounded-full animate-spin"
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">User Management</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {users.length} registered {users.length === 1 ? 'user' : 'users'}
          </p>
        </div>
        <button
          onClick={() => setShowRoleInfo((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 bg-gray-100
                     hover:bg-gray-200 rounded-xl text-sm text-gray-600
                     font-medium transition-colors"
        >
          <Info size={15} />
          Roles
        </button>
      </div>

      {/* Role info panel */}
      {showRoleInfo && (
        <div
          className="bg-white rounded-2xl border border-gray-100 shadow-sm
                        p-4 mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">
              Role Permissions
            </h2>
            <button
              onClick={() => setShowRoleInfo(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ROLE_INFO.map((info) => (
              <div
                key={info.role}
                className={`rounded-xl border p-3 ${COLOR_MAP[info.color]}`}
              >
                <div
                  className="flex items-center gap-2 mb-2 font-semibold
                                text-sm capitalize"
                >
                  {info.icon}
                  {info.role}
                  <span className="ml-auto text-xs font-normal opacity-70">
                    {roleCounts[info.role] ?? 0} users
                  </span>
                </div>
                <ul className="space-y-1">
                  {info.perms.map((p) => (
                    <li key={p} className="text-xs opacity-80 flex gap-1.5">
                      <span>·</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {ROLES.map((role) => (
          <div
            key={role}
            className="bg-white rounded-xl border border-gray-100
                       shadow-sm p-3 text-center"
          >
            <p className="text-xl font-bold text-gray-800">
              {roleCounts[role] ?? 0}
            </p>
            <p className="text-xs text-gray-400 capitalize mt-0.5">{role}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search by name, email or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-4 pr-4 py-2.5 bg-white border border-gray-200
                     rounded-xl text-sm focus:outline-none focus:ring-2
                     focus:ring-pink-400 shadow-sm"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* User list */}
      <div className="space-y-3 pb-6">
        {filtered.map((u) => (
          <UserCard
            key={u.id}
            user={u}
            isCurrentUser={u.id === currentUser?.id}
            changingRole={changingRole === u.id}
            toggling={togglingUser === u.id}
            onRoleChange={(role) => handleRoleChange(u.id, role)}
            onToggleSuspend={() => handleToggleSuspend(u.id, u.suspended)}
          />
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Users size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No users found</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── User Card
function UserCard({
  user,
  isCurrentUser,
  changingRole,
  toggling,
  onRoleChange,
  onToggleSuspend,
}) {
  const [showRoleMenu, setShowRoleMenu] = useState(false)

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm p-4 transition-all
                     ${
                       user.suspended
                         ? 'border-red-100 opacity-70'
                         : 'border-gray-100'
                     }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center
                         text-sm font-bold shrink-0
                         ${
                           user.suspended
                             ? 'bg-gray-100 text-gray-400'
                             : 'bg-pink-100 text-pink-600'
                         }`}
        >
          {user.full_name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-800 text-sm truncate">
              {user.full_name}
            </p>
            {isCurrentUser && (
              <span
                className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5
                               rounded-full font-medium"
              >
                You
              </span>
            )}
            {user.suspended && (
              <span
                className="text-xs bg-red-100 text-red-600 px-2 py-0.5
                               rounded-full font-medium"
              >
                Suspended
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
          </p>
        </div>

        {/* Role badge */}
        <RoleBadge role={user.role} />
      </div>

      {/* Actions — not shown for own account */}
      {!isCurrentUser && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          {/* Role change */}
          <div className="relative flex-1">
            <button
              onClick={() => setShowRoleMenu((v) => !v)}
              disabled={changingRole}
              className="w-full flex items-center justify-between gap-2
                         px-3 py-2 bg-gray-50 hover:bg-gray-100 border
                         border-gray-200 rounded-xl text-xs font-medium
                         text-gray-600 transition-colors disabled:opacity-50"
            >
              <span>Change Role</span>
              {changingRole ? (
                <div
                  className="w-3 h-3 border-2 border-gray-400
                                  border-t-transparent rounded-full animate-spin"
                />
              ) : (
                <ChevronDown size={13} />
              )}
            </button>

            {showRoleMenu && (
              <div
                className="absolute bottom-full left-0 right-0 mb-1
                              bg-white rounded-xl shadow-xl border border-gray-100
                              overflow-hidden z-20"
              >
                {['associate', 'markdown', 'supervisor', 'admin'].map(
                  (role) => (
                    <button
                      key={role}
                      onClick={() => {
                        onRoleChange(role)
                        setShowRoleMenu(false)
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs
                                transition-colors capitalize
                                ${
                                  user.role === role
                                    ? 'bg-pink-50 text-pink-700 font-semibold'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                    >
                      {role === 'admin' && '👑 '}
                      {role === 'supervisor' && '🔷 '}
                      {role === 'markdown' && '🏷️ '}
                      {role === 'associate' && '👤 '}
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                      {user.role === role && ' · Current'}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Suspend / reactivate */}
          <button
            onClick={onToggleSuspend}
            disabled={toggling}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl
                        text-xs font-medium transition-colors border
                        disabled:opacity-50 shrink-0
                        ${
                          user.suspended
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                        }`}
          >
            {toggling ? (
              <div
                className="w-3 h-3 border-2 border-current
                                border-t-transparent rounded-full animate-spin"
              />
            ) : user.suspended ? (
              <>
                <UserCheck size={13} /> Reactivate
              </>
            ) : (
              <>
                <UserX size={13} /> Suspend
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
