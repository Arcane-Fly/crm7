'use client'

import * as React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './context'
import { useToast } from '@/components/ui/use-toast'

interface MFAContextType {
  isEnabled: boolean
  isEnrolling: boolean
  setupMFA: () => Promise<{ qrCode: string; secret: string }>
  verifyMFA: (token: string) => Promise<boolean>
  disableMFA: () => Promise<void>
}

const MFAContext = React.createContext<MFAContextType | null>(null)

export function MFAProvider({ children }: { children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = React.useState(false)
  const [isEnrolling, setIsEnrolling] = React.useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = React.useMemo(() => createClient(), [])

  React.useEffect(() => {
    async function checkMFAStatus() {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('user_mfa')
          .select('enabled')
          .eq('user_id', user.id)
          .single()

        if (error) throw error
        setIsEnabled(data?.enabled ?? false)
      } catch (error) {
        console.error('Error checking MFA status:', error)
      }
    }

    checkMFAStatus()
  }, [user, supabase])

  const setupMFA = React.useCallback(async () => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      setIsEnrolling(true)
      
      const { data, error } = await supabase.rpc('generate_totp_secret', {
        user_id: user.id
      })
      
      if (error) throw error
      
      return {
        qrCode: data.qr_code,
        secret: data.secret
      }
    } catch (error) {
      toast({
        title: 'Error setting up MFA',
        description: 'Failed to set up multi-factor authentication.',
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsEnrolling(false)
    }
  }, [user, toast, supabase])

  const verifyMFA = React.useCallback(async (token: string) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      const { error } = await supabase.rpc('verify_totp', {
        user_id: user.id,
        token
      })
      
      if (error) throw error
      
      setIsEnabled(true)
      return true
    } catch (error) {
      toast({
        title: 'Invalid code',
        description: 'The verification code you entered is invalid.',
        variant: 'destructive',
      })
      return false
    }
  }, [user, toast, supabase])

  const disableMFA = React.useCallback(async () => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      const { error } = await supabase.rpc('disable_mfa', {
        user_id: user.id
      })
      
      if (error) throw error
      
      setIsEnabled(false)
      toast({
        title: 'MFA disabled',
        description: 'Multi-factor authentication has been disabled.',
      })
    } catch (error) {
      toast({
        title: 'Error disabling MFA',
        description: 'Failed to disable multi-factor authentication.',
        variant: 'destructive',
      })
      throw error
    }
  }, [user, toast, supabase])

  return (
    <MFAContext.Provider
      value={{
        isEnabled,
        isEnrolling,
        setupMFA,
        verifyMFA,
        disableMFA,
      }}
    >
      {children}
    </MFAContext.Provider>
  )
}

export function useMFA() {
  const context = React.useContext(MFAContext)
  if (!context) {
    throw new Error('useMFA must be used within an MFAProvider')
  }
  return context
}
