import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { Tag, Eye, EyeOff, Loader2 } from 'lucide-react'

// ── Validation schemas
const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signupSchema = z
  .object({
    full_name: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [showPass, setShowPass] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const isLogin = mode === 'login'
  const schema = isLogin ? loginSchema : signupSchema

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  // ── Switch between login / signup
  function toggleMode() {
    setMode((m) => (m === 'login' ? 'signup' : 'login'))
    setServerError('')
    reset()
  }

  // ── Submit handler
  async function onSubmit(data) {
    setLoading(true)
    setServerError('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        })
        if (error) throw error
        navigate('/inventory')
      } else {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: { full_name: data.full_name },
          },
        })
        if (error) throw error

        // Show success, switch to login
        setServerError('')
        setMode('verify')
      }
    } catch (err) {
      setServerError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Email verification screen
  if (mode === 'verify') {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-pink-50 to-gray-100
                      flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
          <div
            className="w-14 h-14 bg-green-100 rounded-full flex items-center
                          justify-center mx-auto mb-4"
          >
            <span className="text-2xl">✉️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Check your email
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            We sent a confirmation link to your email. Click it to activate your
            account, then sign in.
          </p>
          <button
            onClick={() => setMode('login')}
            className="w-full py-2.5 bg-pink-600 text-white rounded-xl
                       font-medium text-sm hover:bg-pink-700 transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    )
  }

  // ── Main login / signup form
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-pink-50 to-gray-100
                    flex items-center justify-center p-4"
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 bg-pink-600 rounded-2xl flex items-center
                          justify-center mx-auto mb-3 shadow-lg shadow-pink-200"
          >
            <Tag size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">
            <span className="text-pink-600">Runway</span>
            <span className="text-gray-800">-519</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Off-price inventory platform
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {['login', 'signup'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setMode(tab)
                  setServerError('')
                  reset()
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all
                            ${
                              mode === tab
                                ? 'bg-white text-pink-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
              >
                {tab === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full name — signup only */}
            {!isLogin && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Full Name
                </label>
                <input
                  {...register('full_name')}
                  placeholder="Jane Smith"
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm
                              focus:outline-none focus:ring-2 focus:ring-pink-400
                              transition-colors
                              ${
                                errors.full_name
                                  ? 'border-red-400 bg-red-50'
                                  : 'border-gray-300'
                              }`}
                />
                {errors.full_name && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.full_name.message}
                  </p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@email.com"
                autoComplete="email"
                className={`w-full px-3 py-2.5 border rounded-xl text-sm
                            focus:outline-none focus:ring-2 focus:ring-pink-400
                            transition-colors
                            ${
                              errors.email
                                ? 'border-red-400 bg-red-50'
                                : 'border-gray-300'
                            }`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className={`w-full px-3 py-2.5 pr-10 border rounded-xl text-sm
                              focus:outline-none focus:ring-2 focus:ring-pink-400
                              transition-colors
                              ${
                                errors.password
                                  ? 'border-red-400 bg-red-50'
                                  : 'border-gray-300'
                              }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm password — signup only */}
            {!isLogin && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Confirm Password
                </label>
                <input
                  {...register('confirm')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm
                              focus:outline-none focus:ring-2 focus:ring-pink-400
                              transition-colors
                              ${
                                errors.confirm
                                  ? 'border-red-400 bg-red-50'
                                  : 'border-gray-300'
                              }`}
                />
                {errors.confirm && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.confirm.message}
                  </p>
                )}
              </div>
            )}

            {/* Server error */}
            {serverError && (
              <div
                className="bg-red-50 border border-red-200 rounded-xl
                              px-3 py-2.5"
              >
                <p className="text-xs text-red-600">{serverError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-pink-600 text-white rounded-xl
                         font-medium text-sm hover:bg-pink-700 transition-colors
                         disabled:opacity-60 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Runway-519 · For authorized store associates only
        </p>
      </div>
    </div>
  )
}
