import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Create a singleton instance for the browser
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Create a new client for server-side usage
export const createServerSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Create a new client for browser usage when needed
export const createBrowserSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

export const authConfig = {
  auth0: {
    domain: process.env.AUTH0_DOMAIN!,
    clientId: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    apiUrl: process.env.AUTH0_ADMIN_API_KEY!,
  },
  cookies: {
    name: 'sb-auth',
    lifetime: 60 * 60 * 24 * 7, // 7 days
  },
}
