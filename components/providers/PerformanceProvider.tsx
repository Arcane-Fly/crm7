'use client';

import { initialState, performanceReducer } from '@/lib/reducers/performance';
import type { PerformanceContextType } from '@/lib/types';
import { createContext, useContext, useReducer, type ReactNode } from 'react';

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

interface PerformanceProviderProps {
  children: ReactNode;
}

export function PerformanceProvider({ children }: PerformanceProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(performanceReducer, initialState);

  return (
    <PerformanceContext.Provider value={{ state, dispatch }}>
      {children}
    </PerformanceContext.Provider>
  );
}

export { PerformanceContext }; // Explicitly export PerformanceContext

export function usePerformanceContext(): PerformanceContextType {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformanceContext must be used within a PerformanceProvider');
  }
  return context;
}
