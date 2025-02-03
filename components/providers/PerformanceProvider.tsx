import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { performanceReducer, initialState } from '@/lib/reducers/performance';
import type { PerformanceContextType } from '@/lib/types';

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

interface PerformanceProviderProps {
  children: ReactNode;
}

export function PerformanceProvider({ children }: PerformanceProviderProps): React.ReactElement {
  const [state, dispatch] = useReducer(performanceReducer, initialState);

  return (
    <PerformanceContext.Provider value={{ state, dispatch }}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformanceContext(): PerformanceContextType {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformanceContext must be used within a PerformanceProvider');
  }
  return context;
}
