import { Auth0Client } from '@auth0/auth0-spa-js';
import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

if (!process.env.NEXT_PUBLIC_AUTH0_DOMAIN) {
  throw new Error('Missing NEXT_PUBLIC_AUTH0_DOMAIN');
}

if (!process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID) {
  throw new Error('Missing NEXT_PUBLIC_AUTH0_CLIENT_ID');
}

// Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Auth0 client
export const auth0 = new Auth0Client({
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
  clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
    audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
    scope: 'openid profile email'
  },
  cacheLocation: 'localstorage',
  useRefreshTokens: true
});
