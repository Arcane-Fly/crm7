export interface PerformanceState {
  metrics: {
    fcp: number | null;
    lcp: number | null;
    fid: number | null;
    cls: number | null;
    ttfb: number | null;
  };
}

export const initialState: PerformanceState = {
  metrics: {
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  },
};

type PerformanceAction = 
  | { type: 'SET_FCP'; payload: number }
  | { type: 'SET_LCP'; payload: number }
  | { type: 'SET_FID'; payload: number }
  | { type: 'SET_CLS'; payload: number }
  | { type: 'SET_TTFB'; payload: number };

export function performanceReducer(state: PerformanceState, action: PerformanceAction): PerformanceState {
  switch (action.type) {
    case 'SET_FCP':
      return {
        ...state,
        metrics: { ...state.metrics, fcp: action.payload },
      };
    case 'SET_LCP':
      return {
        ...state,
        metrics: { ...state.metrics, lcp: action.payload },
      };
    case 'SET_FID':
      return {
        ...state,
        metrics: { ...state.metrics, fid: action.payload },
      };
    case 'SET_CLS':
      return {
        ...state,
        metrics: { ...state.metrics, cls: action.payload },
      };
    case 'SET_TTFB':
      return {
        ...state,
        metrics: { ...state.metrics, ttfb: action.payload },
      };
    default:
      return state;
  }
}
