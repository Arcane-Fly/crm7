import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useState } from 'react';

import { createBrowserSupabaseClient } from '@/lib/auth/config';

export default function LoginPage() {
  const [supabase] = useState(() => createBrowserSupabaseClient());

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='w-full max-w-md rounded-lg border p-8 shadow-lg'>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['github', 'google']}
          redirectTo={`${window.location.origin}/auth/callback`}
        />
      </div>
    </div>
  );
}
