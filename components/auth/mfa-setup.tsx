'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createBrowserClient } from '@supabase/ssr';

interface MFASetupProps {
  qrCode: string;
  onVerify: (code: string) => Promise<boolean>;
  onComplete: () => void;
}

export function MFASetup({ qrCode, onVerify, onComplete }: MFASetupProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleVerify = async () => {
    if (!verificationCode) {
      setError('Please enter a verification code');
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);
      // First get a challenge
      const { data: challengeData } = await supabase.auth.mfa.challenge({ factorId: qrCode });
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
        factorId: qrCode,
        challengeId: challengeData.id,
        code: verificationCode,
      });

      if (error) throw error;

      toast({
        title: 'MFA Setup Complete',
        description: 'Two-factor authentication has been enabled for your account.',
      });

      onComplete();
    } catch (err) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const setupMFA = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) throw error;

      onVerify(data.totp.qr_code);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to setup MFA. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Up Two-Factor Authentication</CardTitle>
        <CardDescription>
          Scan the QR code with your authenticator app and enter the verification code below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!qrCode ? (
          <Button
            onClick={setupMFA}
            className="w-full"
          >
            Begin MFA Setup
          </Button>
        ) : (
          <div>
            <div className="flex justify-center">
              <Image
                src={qrCode}
                alt="QR Code for MFA setup"
                width={200}
                height={200}
                className="border rounded-lg p-2"
              />
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                className="text-center text-2xl tracking-wider"
              />
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <Button
              onClick={handleVerify}
              disabled={isVerifying || !verificationCode}
              className="w-full"
            >
              {isVerifying ? 'Verifying...' : 'Verify Code'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
