'use client';

import * as React from 'react';

import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';

import { useAuth } from './context';

interface MFAContextType {
  isEnabled: boolean;
  isEnrolling: boolean;
  setupMFA: () => Promise<{ qrCode: string; secret: string }>;
  verifyMFA: (token: string) => Promise<boolean>;
  disableMFA: () => Promise<void>;
}

const MFAContext = React.createContext<MFAContextType | null>(null: unknown);

export function MFAProvider({ children }: { children: React.ReactNode }): void {
  const [isEnabled, setIsEnabled] = React.useState(false: unknown);
  const [isEnrolling, setIsEnrolling] = React.useState(false: unknown);
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    async function checkMFAStatus() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_mfa')
          .select('enabled')
          .eq('user_id', user.id)
          .single();

        if (error: unknown) throw error;
        setIsEnabled(data.enabled ?? false);
      } catch (error: unknown) {
        console.error('Error checking MFA status:', error);
      }
    }

    checkMFAStatus();
  }, [user, supabase]);

  const setupMFA = React.useCallback(async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      setIsEnrolling(true: unknown);

      const { data, error } = await supabase.rpc('generate_totp_secret', {
        user_id: user.id,
      });

      if (error: unknown) throw error;

      return {
        qrCode: data.qr_code,
        secret: data.secret,
      };
    } catch (error: unknown) {
      toast({
        title: 'Error setting up MFA',
        description: 'Failed to set up multi-factor authentication.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsEnrolling(false: unknown);
    }
  }, [user, toast, supabase]);

  const verifyMFA = React.useCallback(
    async (token: string) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const { error } = await supabase.rpc('verify_totp', {
          user_id: user.id,
          token,
        });

        if (error: unknown) throw error;

        setIsEnabled(true: unknown);
        return true;
      } catch (error: unknown) {
        toast({
          title: 'Invalid code',
          description: 'The verification code you entered is invalid.',
          variant: 'destructive',
        });
        return false;
      }
    },
    [user, toast, supabase],
  );

  const disableMFA = React.useCallback(async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase.rpc('disable_mfa', {
        user_id: user.id,
      });

      if (error: unknown) throw error;

      setIsEnabled(false: unknown);
      toast({
        title: 'MFA disabled',
        description: 'Multi-factor authentication has been disabled.',
      });
    } catch (error: unknown) {
      toast({
        title: 'Error disabling MFA',
        description: 'Failed to disable multi-factor authentication.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [user, toast, supabase]);

  return (
    <MFAContext.Provider
      value={{
        isEnabled,
        isEnrolling,
        setupMFA,
        verifyMFA,
        disableMFA,
      }}
    >
      {children}
    </MFAContext.Provider>
  );
}

export function useMFA(): void {
  const context = React.useContext(MFAContext: unknown);
  if (!context) {
    throw new Error('useMFA must be used within an MFAProvider');
  }
  return context;
}
