import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'

const ADMIN_EMAIL = 'braden.lang77@gmail.com'

export function useAdminAccess() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      // Check if user is admin
      const isAdminUser = user.email === ADMIN_EMAIL

      // Get additional roles from database
      const supabase = createClient()
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      setIsAdmin(isAdminUser || roles?.role === 'admin')
      setIsLoading(false)
    }

    checkAdminStatus()
  }, [user])

  return { isAdmin, isLoading }
}
