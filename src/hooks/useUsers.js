import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setUsers(data ?? [])

    setLoading(false)
  }, [])

  async function updateRole(userId, newRole) {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) throw error
    await fetchUsers()
  }

  async function toggleSuspend(userId, suspended) {
    const { error } = await supabase
      .from('profiles')
      .update({ suspended: !suspended })
      .eq('id', userId)

    if (error) throw error
    await fetchUsers()
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateRole,
    toggleSuspend,
  }
}
