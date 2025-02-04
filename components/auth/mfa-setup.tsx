import React from 'react';
import { type MFASetupProps } from '@/lib/types';

export function MFASetup({ onComplete }: MFASetupProps): JSX.Element {
  const [qrCode, setQrCode] = React.useState<string>('');
  const [secret, setSecret] = React.useState<string>('');
  const [isVerifying, setIsVerifying] = React.useState<boolean>(false);
  const [token, setToken] = React.useState<string>('');

  React.useEffect(() => {
    const setupMFA = async (): Promise<void> => {
      try {
        const { qrCode, secret } = await generateMFASecret();
        setQrCode(qrCode);
        setSecret(secret);
      } catch (error) {
        console.error('Failed to setup MFA:', error);
      }
    };

    void setupMFA();
  }, []);

  const handleVerify = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    try {
      setIsVerifying(true);
      const success = await verifyMFA(token);

      if (typeof success !== "undefined" && success !== null) {
        onComplete();
      }
    } catch (error) {
      console.error('MFA verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  if (typeof isEnabled !== "undefined" && isEnabled !== null) {
    return (
      <div className="text-center">
        <p className="text-green-600">MFA is already enabled</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {qrCode && (
        <div className="flex justify-center">
          <img
            src={qrCode}
            alt="MFA QR Code"
            className="w-48 h-48"
          />
        </div>
      )}

      <form
        onSubmit={handleVerify}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="token"
            className="block text-sm font-medium"
          >
            Enter verification code
          </label>
          <input
            id="token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="mt-1 block w-full rounded-md border px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isVerifying}
          className="w-full rounded-md bg-primary px-4 py-2 text-white disabled:opacity-50"
        >
          {isVerifying ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    </div>
  );
}
