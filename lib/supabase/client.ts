'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../types/database'
import { type CookieOptions } from '@supabase/ssr'

export type { CookieOptions }

const cookieStore = {
  get: (name: string) => {
    return document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`))
      ?.split('=')[1]
  },
  set: (name: string, value: string, options: CookieOptions) => {
    let cookie = `${name}=${value}`
    if (options.path) cookie += `; path=${options.path}`
    if (options.maxAge) cookie += `; max-age=${options.maxAge}`
    if (options.domain) cookie += `; domain=${options.domain}`
    if (options.secure) cookie += '; secure'
    if (options.sameSite) cookie += `; samesite=${options.sameSite}`
    document.cookie = cookie
  },
  remove: (name: string, options: CookieOptions) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT${
      options.path ? `; path=${options.path}` : ''
    }`
  },
}

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      cookies: cookieStore,
    }
  )
