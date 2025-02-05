import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? undefined,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? undefined
);

export default function AuthCallbackPage(): null {
  const router = useRouter();

  useEffect((): void => {
    const handleAuthCallback = async (): Promise<void> => {
      const { searchParams } = new URL(window.location.href);
      const code = searchParams.get('code');
      const next = searchParams.get('next') ?? '/';

      if (typeof code !== "undefined" && code !== null) {
        await supabase.auth.exchangeCodeForSession(code);
      }

      router.push(next);
    };

    handleAuthCallback();
  }, [router]);

  return null;
}
