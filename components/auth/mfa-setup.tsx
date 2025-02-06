'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBrowserClient } from '@supabase/ssr';
import { QrCode } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface FormValues {
  code: string;
}

const formSchema = z.object({
  code: z.string().min(6).max(6),
});

export function MFASetup() {
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      // First get a challenge
      const { data: challengeData } = await supabase.auth.mfa.challenge({ factorId: secret });
      if (!challengeData?.id) {
        toast({
          title: 'Error',
          description: 'Failed to create MFA challenge',
          variant: 'destructive',
        });
        return;
      }

      // Then verify with the challenge
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: secret,
        challengeId: challengeData.id,
        code: values.code,
      });

      if (error) throw error;

      toast({
        title: 'MFA Setup Complete',
        description: 'Two-factor authentication has been enabled for your account.',
      });

      // Redirect or update UI state
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify MFA code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const setupMFA = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to setup MFA. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Setup Two-Factor Authentication</CardTitle>
      </CardHeader>
      <CardContent>
        {!qrCode ? (
          <Button
            onClick={setupMFA}
            disabled={loading}
            className="w-full"
          >
            <QrCode className="mr-2 h-4 w-4" />
            Begin MFA Setup
          </Button>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <img
                src={qrCode}
                alt="QR Code for MFA"
                className="w-48 h-48"
              />
              <p className="text-sm text-muted-foreground text-center">
                Scan this QR code with your authenticator app
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter 6-digit code"
                          {...field}
                          maxLength={6}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  Verify and Enable
                </Button>
              </form>
            </Form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
