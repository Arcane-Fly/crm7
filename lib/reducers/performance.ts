import type { PerformanceState, PerformanceAction } from '@/lib/types';

export interface PerformanceState {
  memory: any | null;
  timing: any | null;
  navigation: any | null;
}

export const initialState: PerformanceState = {
  memory: null,
  timing: null,
  navigation: null,
};

type PerformanceAction =
  | { type: 'UPDATE_MEMORY'; payload: any }
  | { type: 'UPDATE_TIMING'; payload: any }
  | { type: 'UPDATE_NAVIGATION'; payload: any };

export type { PerformanceAction }; // Export PerformanceAction

export function performanceReducer(state: PerformanceState, action: PerformanceAction): PerformanceState {
  switch (action.type) {
    case 'UPDATE_MEMORY':
      return {
        ...state,
        memory: action.payload,
      };
    case 'UPDATE_TIMING':
      return {
        ...state,
        timing: action.payload,
      };
    case 'UPDATE_NAVIGATION':
      return {
        ...state,
        navigation: action.payload,
      };
    default:
      return state;
  }
}
