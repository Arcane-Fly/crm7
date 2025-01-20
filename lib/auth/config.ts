import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()

export const authConfig = {
  auth0: {
    domain: 'dev-rkchrceel6xwqe2g.us.auth0.com',
    apiUrl: process.env.AUTH0_ADMIN_API_KEY,
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  cookies: {
    name: 'sb-auth',
    lifetime: 60 * 60 * 24 * 7, // 7 days
    domain: process.env.NEXT_PUBLIC_DOMAIN || 'localhost',
    secure: process.env.NODE_ENV === 'production',
  },
}
