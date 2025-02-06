'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/utils/supabase/client';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState<string>('');
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const handleAuthChange = async (event: any, session: any) => {
    if (event === 'SIGNED_IN' && session) {
      setLoading(true);
      try {
        await router.push('/dashboard');
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });
      } catch (error) {
        console.error('Error redirecting:', error);
        toast({
          title: 'Error',
          description: 'Failed to redirect after login',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (!origin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'rgb(var(--primary))',
                      brandAccent: 'rgb(var(--primary-foreground))',
                    },
                  },
                },
              }}
              providers={['github', 'google']}
              redirectTo={`${origin}/auth/callback`}
              onAuthStateChange={handleAuthChange}
              theme="dark"
              socialLayout="horizontal"
              showLinks={false}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
