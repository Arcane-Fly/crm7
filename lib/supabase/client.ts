'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../types/database'
import type { CookieOptions } from '@supabase/ssr'

export type { CookieOptions }

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return ''
          return document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
            ?.split('=')[1]
        },
        set(name: string, value: string, options: CookieOptions) {
          if (typeof document === 'undefined') return
          let cookie = `${name}=${value}`
          if (options.path) cookie += `; path=${options.path}`
          if (options.maxAge) cookie += `; max-age=${options.maxAge}`
          if (options.domain) cookie += `; domain=${options.domain}`
          if (options.secure) cookie += '; secure'
          document.cookie = cookie
        },
        remove(name: string, options: CookieOptions) {
          if (typeof document === 'undefined') return
          document.cookie = `${name}=; max-age=0${options.path ? `; path=${options.path}` : ''}`
        },
      },
    }
  )
}
