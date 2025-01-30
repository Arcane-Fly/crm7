'use client';

import { createContext, useContext, useReducer, type ReactNode, type ReactElement } from 'react';

import { logger } from '@/lib/utils/logger';

interface PerformanceMetric {
  timestamp: number;
  value: number;
  type: 'pageLoad' | 'memory' | 'networkRequest';
}

interface PerformanceState {
  metrics: PerformanceMetric[];
}

type PerformanceAction =
  | { type: 'ADD_METRIC'; payload: PerformanceMetric }
  | { type: 'CLEAR_METRICS' };

const initialState: PerformanceState = {
  metrics: [],
};

function performanceReducer(state: PerformanceState, action: PerformanceAction): PerformanceState {
  switch (action.type) {
    case 'ADD_METRIC':
      return {
        ...state,
        metrics: [...state.metrics, action.payload],
      };
    case 'CLEAR_METRICS':
      return {
        ...state,
        metrics: [],
      };
    default:
      return state;
  }
}

interface PerformanceContextType {
  state: PerformanceState;
  addMetric: (metric: PerformanceMetric) => void;
  clearMetrics: () => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

interface PerformanceProviderProps {
  children: ReactNode;
}

export function PerformanceProvider({ children }: PerformanceProviderProps): ReactElement {
  const [state, dispatch] = useReducer(performanceReducer, initialState);

  const addMetric = (metric: PerformanceMetric) => {
    try {
      dispatch({ type: 'ADD_METRIC', payload: metric });
    } catch (error) {
      logger.error('Failed to add metric', { error, metric });
    }
  };

  const clearMetrics = () => {
    try {
      dispatch({ type: 'CLEAR_METRICS' });
    } catch (error) {
      logger.error('Failed to clear metrics', { error });
    }
  };

  return (
    <PerformanceContext.Provider value={{ state, addMetric, clearMetrics }}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance(): PerformanceContextType {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}
