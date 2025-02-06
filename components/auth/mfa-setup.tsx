'use client';

import React from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function MFASetup(): React.ReactElement {
  const [secret, setSecret] = React.useState<string>('');
  const [qrCode, setQrCode] = React.useState<string>('');
  const [token, setToken] = React.useState<string>('');
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const supabase = createClient();

  React.useEffect(() => {
    const setupMFA = async (): Promise<void> => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found');

        const { data, error: setupError } = await supabase.functions.invoke('generate-mfa-secret', {
          body: { userId: user.id }
        });

        if (setupError) throw setupError;
        if (!data?.secret || !data?.qrCode) throw new Error('Failed to generate MFA secret');

        setSecret(data.secret);
        setQrCode(data.qrCode);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to setup MFA');
      }
    };

    void setupMFA();
  }, [supabase]);

  const handleVerify = async (): Promise<void> => {
    if (!token || token.length !== 6) {
      setError('Please enter a valid 6-digit token');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { error: verifyError } = await supabase.functions.invoke('verify-mfa-token', {
        body: { userId: user.id, token, secret }
      });

      if (verifyError) throw verifyError;

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify token');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MFA Setup Complete</CardTitle>
          <CardDescription>
            Two-factor authentication has been successfully enabled for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Your account is now more secure with two-factor authentication.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Up Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enhance your account security by enabling two-factor authentication.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {qrCode && (
          <div className="space-y-4">
            <div>
              <Label>1. Scan QR Code</Label>
              <div className="mt-2 flex justify-center">
                <img
                  src={qrCode}
                  alt="QR Code for MFA setup"
                  className="h-48 w-48"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="token">2. Enter Verification Code</Label>
              <Input
                id="token"
                type="text"
                placeholder="Enter 6-digit code"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => window.location.href = '/settings'}
        >
          Cancel
        </Button>
        <Button
          onClick={() => void handleVerify()}
          disabled={isVerifying || !token || token.length !== 6}
        >
          {isVerifying ? 'Verifying...' : 'Verify'}
        </Button>
      </CardFooter>
    </Card>
  );
}
