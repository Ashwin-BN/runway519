import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute() {
  const { user, loading, isSuspended, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div
            className="w-10 h-10 border-4 border-pink-500 border-t-transparent
                          rounded-full animate-spin mx-auto mb-3"
          />
          <p className="text-gray-500 text-sm">Loading Runway-519...</p>
        </div>
      </div>
    )
  }

  // Suspended users see a block screen
  if (user && isSuspended) {
    return (
      <div
        className="min-h-screen flex items-center justify-center
                      bg-gray-50 p-4"
      >
        <div
          className="bg-white rounded-2xl shadow-lg p-8 max-w-sm
                        w-full text-center"
        >
          <div
            className="w-14 h-14 bg-red-100 rounded-full flex items-center
                          justify-center mx-auto mb-4"
          >
            <span className="text-2xl">🚫</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Account Suspended
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Your account has been suspended. Please contact your store
            administrator for assistance.
          </p>
          <button
            onClick={signOut}
            className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl
                       font-medium text-sm hover:bg-gray-200 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}
