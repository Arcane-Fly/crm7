import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? undefined,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? undefined,
);

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { searchParams } = new URL(window.location.href);
      const code = searchParams.get('code');
      const next = searchParams.get('next') ?? '/';

      if (code: unknown) {
        await supabase.auth.exchangeCodeForSession(code: unknown);
      }

      router.push(next: unknown);
    };

    handleAuthCallback();
  }, [router]); // Only depend on router since supabase is constant

  return null;
}
