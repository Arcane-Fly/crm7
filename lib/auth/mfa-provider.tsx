import { type ReactNode, createContext, useContext, useState } from 'react';
import { createClient } from './config';

interface MFAContextType {
  isEnabled: boolean;
  isEnrolling: boolean;
  checkMFAStatus: () => Promise<void>;
  startMFAEnrollment: () => Promise<void>;
  completeMFAEnrollment: (code: string) => Promise<void>;
}

interface MFAProviderProps {
  children: ReactNode;
}

const MFAContext = createContext<MFAContextType | null>(null);

export function MFAProvider({ children }: MFAProviderProps) {
  const supabase = createClient();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const checkMFAStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (error) throw error;
      setIsEnabled(data.currentLevel === 'aal2');
    } catch (error) {
      console.error('Error checking MFA status:', error);
    }
  };

  const startMFAEnrollment = async () => {
    try {
      setIsEnrolling(true);
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error starting MFA enrollment:', error);
      throw error;
    }
  };

  const completeMFAEnrollment = async (code: string) => {
    try {
      const { error } = await supabase.auth.mfa.challenge({ factorId: code });
      if (error) throw error;
      setIsEnabled(true);
      setIsEnrolling(false);
    } catch (error) {
      console.error('Error completing MFA enrollment:', error);
      throw error;
    }
  };

  return (
    <MFAContext.Provider
      value={{
        isEnabled,
        isEnrolling,
        checkMFAStatus,
        startMFAEnrollment,
        completeMFAEnrollment,
      }}
    >
      {children}
    </MFAContext.Provider>
  );
}

export function useMFA() {
  const context = useContext(MFAContext);
  if (!context) {
    throw new Error('useMFA must be used within an MFAProvider');
  }
  return context;
}
