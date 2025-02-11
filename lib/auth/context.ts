'use client';

import { createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  getUser: () => Promise<User | null>;
  getSession: () => Promise<{ user: User | null }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  getUser: async () => null,
  getSession: async () => ({ user: null }),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
