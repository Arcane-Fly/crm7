import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { createBrowserSupabaseClient } from '@/lib/auth/config'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { searchParams } = new URL(window.location.href)
      const code = searchParams.get('code')
      const next = searchParams.get('next') ?? '/'

      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
      }

      router.push(next)
    }

    handleAuthCallback()
  }, [router, supabase.auth])

  return null
}
