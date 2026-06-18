import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useAppToast } from '../components/layout/AppLayout'
import { compressImage } from '../utils/compressImage'
import RoleBadge from '../components/ui/RoleBadge'
import Button from '../components/ui/Button'
import {
  ArrowLeft, Camera, User, Mail, Shield,
  Calendar, Package, Tag, TrendingDown,
  Loader2, Edit2, Check, X,
} from 'lucide-react'

// ── Validation
const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email:     z.string().email('Enter a valid email'),
})

export default function ProfilePage() {
  const navigate                        = useNavigate()
  const { user, profile, refreshProfile } = useAuth()
  const toast                           = useAppToast()
  const avatarInputRef                  = useRef()

  const [stats,          setStats]          = useState(null)
  const [statsLoading,   setStatsLoading]   = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [editMode,       setEditMode]       = useState(false)
  const [avatarPreview,  setAvatarPreview]  = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      email:     profile?.email     ?? '',
    },
  })

  // Reset form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name ?? '',
        email:     profile.email     ?? '',
      })
      setAvatarPreview(profile.avatar_url ?? null)
    }
  }, [profile, reset])

  // Load personal stats
  useEffect(() => {
    if (!user?.id) return
    async function loadStats() {
      setStatsLoading(true)
      const { data: items } = await supabase
        .from('items')
        .select('id, status, price, created_at')
        .eq('added_by', user.id)

      if (items) {
        const active   = items.filter(i => i.status === 'active').length
        const markdown = items.filter(i => i.status === 'markdown').length
        const sold     = items.filter(i => i.status === 'sold').length
        const total    = items.length
        const value    = items
          .filter(i => i.status === 'active')
          .reduce((sum, i) => sum + Number(i.price), 0)

        setStats({ total, active, markdown, sold, value })
      }
      setStatsLoading(false)
    }
    loadStats()
  }, [user?.id])

  // ── Save profile info
  async function onSubmit(data) {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name.trim(),
          email:     data.email.trim(),
        })
        .eq('id', user.id)

      if (error) throw error

      // Update email in Supabase Auth if changed
      if (data.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: data.email.trim(),
        })
        if (authError) throw authError
      }

      await refreshProfile()
      toast.success('Profile updated')
      setEditMode(false)
    } catch (err) {
      toast.error(err.message ?? 'Could not save profile')
    } finally {
      setSaving(false)
    }
  }

  // ── Upload avatar
  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarUploading(true)
    try {
      const compressed = await compressImage(file, {
        maxWidth: 400, maxHeight: 400, quality: 0.85,
      })

      const ext  = 'jpg'
      const path = `${user.id}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, compressed, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      // Add cache-buster so browser re-fetches
      const urlWithBust = `${publicUrl}?t=${Date.now()}`

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlWithBust })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarPreview(urlWithBust)
      await refreshProfile()
      toast.success('Profile photo updated')
    } catch (err) {
      toast.error(err.message ?? 'Photo upload failed')
    } finally {
      setAvatarUploading(false)
      e.target.value = ''
    }
  }

  // ── Remove avatar
  async function handleRemoveAvatar() {
    try {
      const path = `${user.id}/avatar.jpg`
      await supabase.storage.from('avatars').remove([path])
      await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id)

      setAvatarPreview(null)
      await refreshProfile()
      toast.success('Profile photo removed')
    } catch (err) {
      toast.error('Could not remove photo')
    }
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?'

  return (
    <div className="max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-brand-border
                     text-gray-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            My Profile
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage your account details
          </p>
        </div>
      </div>

      {/* Avatar section */}
      <div className="bg-white dark:bg-brand-surface rounded-2xl border
                      border-gray-100 dark:border-brand-border shadow-sm
                      p-6 mb-4 flex flex-col items-center gap-4">

        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-brand-teal/10
                          border-4 border-brand-teal/20 flex items-center
                          justify-center shrink-0">
            {avatarUploading ? (
              <Loader2 size={28} className="text-brand-teal animate-spin" />
            ) : avatarPreview ? (
              <img
                src={avatarPreview}
                alt={profile?.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-brand-teal">
                {initials}
              </span>
            )}
          </div>

          {/* Camera button */}
          <button
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarUploading}
            className="absolute bottom-0 right-0 w-8 h-8 bg-brand-teal
                       hover:bg-brand-tealDark rounded-full flex items-center
                       justify-center shadow-lg transition-colors
                       disabled:opacity-60"
            title="Change photo"
          >
            <Camera size={14} className="text-white" />
          </button>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Name + role */}
        <div className="text-center">
          <p className="text-lg font-bold text-gray-800 dark:text-white">
            {profile?.full_name ?? 'Associate'}
          </p>
          <p className="text-sm text-gray-400 mb-2">{profile?.email}</p>
          <RoleBadge role={profile?.role ?? 'associate'} />
        </div>

        {/* Remove photo link */}
        {avatarPreview && (
          <button
            onClick={handleRemoveAvatar}
            className="text-xs text-red-400 hover:text-red-500
                       hover:underline transition-colors"
          >
            Remove photo
          </button>
        )}

        {/* Joined date */}
        {profile?.created_at && (
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <Calendar size={12} />
            Joined {format(new Date(profile.created_at), 'MMMM d, yyyy')}
          </p>
        )}
      </div>

      {/* Personal stats */}
      <div className="bg-white dark:bg-brand-surface rounded-2xl border
                      border-gray-100 dark:border-brand-border shadow-sm
                      p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300
                       mb-3 flex items-center gap-2">
          <Package size={15} className="text-brand-teal" />
          Your Contributions
        </h2>

        {statsLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-brand-border
                                      rounded-xl animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<Package size={15} />}
              label="Items Added"
              value={stats.total}
              color="teal"
            />
            <StatCard
              icon={<Tag size={15} />}
              label="Active Items"
              value={stats.active}
              color="green"
            />
            <StatCard
              icon={<TrendingDown size={15} />}
              label="On Markdown"
              value={stats.markdown}
              color="yellow"
            />
            <StatCard
              icon={<Shield size={15} />}
              label="Sold"
              value={stats.sold}
              color="gray"
            />
          </div>
        ) : null}

        {stats?.value > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100
                          dark:border-brand-border text-center">
            <p className="text-xs text-gray-400">Your active inventory value</p>
            <p className="text-xl font-bold text-brand-teal mt-0.5">
              ${stats.value.toLocaleString('en-CA', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        )}
      </div>

      {/* Edit profile form */}
      <div className="bg-white dark:bg-brand-surface rounded-2xl border
                      border-gray-100 dark:border-brand-border shadow-sm p-4 mb-6">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300
                         flex items-center gap-2">
            <Edit2 size={14} className="text-brand-teal" />
            Account Details
          </h2>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="text-xs text-brand-teal hover:text-brand-tealDark
                         font-medium transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {editMode ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Full name */}
            <div>
              <label className="text-xs font-medium text-gray-500
                                dark:text-gray-400 block mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2
                                           -translate-y-1/2 text-gray-400" />
                <input
                  {...register('full_name')}
                  placeholder="Your full name"
                  className={`w-full pl-9 pr-4 py-2.5 border rounded-xl
                              text-sm focus:outline-none focus:ring-2
                              focus:ring-brand-teal transition-colors
                              dark:bg-brand-border dark:text-white
                              ${errors.full_name
                                ? 'border-red-400 bg-red-50'
                                : 'border-gray-300 dark:border-brand-border'
                              }`}
                />
              </div>
              {errors.full_name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-gray-500
                                dark:text-gray-400 block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2
                                           -translate-y-1/2 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="your@email.com"
                  className={`w-full pl-9 pr-4 py-2.5 border rounded-xl
                              text-sm focus:outline-none focus:ring-2
                              focus:ring-brand-teal transition-colors
                              dark:bg-brand-border dark:text-white
                              ${errors.email
                                ? 'border-red-400 bg-red-50'
                                : 'border-gray-300 dark:border-brand-border'
                              }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Changing your email will require re-verification
              </p>
            </div>

            {/* Role — read only */}
            <div>
              <label className="text-xs font-medium text-gray-500
                                dark:text-gray-400 block mb-1.5">
                Role
              </label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50
                              dark:bg-brand-border border border-gray-200
                              dark:border-brand-border rounded-xl">
                <Shield size={14} className="text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400
                                 capitalize flex-1">
                  {profile?.role ?? 'associate'}
                </span>
                <span className="text-xs text-gray-400">
                  Contact admin to change
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setEditMode(false)
                  reset()
                }}
              >
                <X size={14} />
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="flex-1"
                loading={saving}
                disabled={!isDirty}
              >
                <Check size={14} />
                Save Changes
              </Button>
            </div>

          </form>
        ) : (
          // Read-only view
          <div className="space-y-3">
            <InfoRow
              icon={<User size={14} />}
              label="Full Name"
              value={profile?.full_name ?? '—'}
            />
            <InfoRow
              icon={<Mail size={14} />}
              label="Email"
              value={profile?.email ?? '—'}
            />
            <InfoRow
              icon={<Shield size={14} />}
              label="Role"
              value={
                <RoleBadge role={profile?.role ?? 'associate'} />
              }
            />
            <InfoRow
              icon={<Calendar size={14} />}
              label="Member Since"
              value={profile?.created_at
                ? format(new Date(profile.created_at), 'MMMM d, yyyy')
                : '—'
              }
            />
          </div>
        )}
      </div>

    </div>
  )
}

// ── Stat card
function StatCard({ icon, label, value, color }) {
  const colors = {
    teal:   'text-brand-teal bg-brand-teal/10',
    green:  'text-green-600 bg-green-50 dark:bg-green-900/20',
    yellow: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    gray:   'text-gray-500 bg-gray-100 dark:bg-brand-border',
  }

  return (
    <div className="bg-gray-50 dark:bg-brand-border rounded-xl p-3">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center
                       mb-2 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-lg font-bold text-gray-800 dark:text-white leading-none">
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}

// ── Info row
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100
                    dark:border-brand-border last:border-0">
      <div className="text-gray-400 mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {value}
        </div>
      </div>
    </div>
  )
}
