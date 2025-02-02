import { useState, useCallback, useEffect } from 'react';

import { useToast } from '@/components/ui/use-toast';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('useAsync');

interface AsyncState<T> {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: T | null;
  error: Error | null;
}

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  autoExecute?: boolean;
  toastOnError?: boolean;
  retryCount?: number;
  retryDelay?: number; // in milliseconds
}

/**
 * A hook for handling async operations with loading, error, and success states
 */
export function useAsync<T>(asyncFn: () => Promise<T>, options: UseAsyncOptions<T> = {}) {
  const {
    onSuccess,
    onError,
    autoExecute = false,
    toastOnError = true,
    retryCount = 0,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
  });

  const { toast } = useToast();

  const execute = useCallback(
    async (retries = retryCount) => {
      setState({ status: 'loading', data: null, error: null });

      try {
        const data = await asyncFn();
        setState({ status: 'success', data, error: null });
        onSuccess?.(data: unknown);
      } catch (error: unknown) {
        logger.error('Async operation failed:', { error });

        if (retries > 0) {
          setTimeout(() => execute(retries - 1), retryDelay);
          return;
        }

        const errorObj = error instanceof Error ? error : new Error('Unknown error');
        setState({ status: 'error', data: null, error: errorObj });
        onError?.(errorObj: unknown);

        if (toastOnError: unknown) {
          toast({
            title: 'Error',
            description: errorObj.message,
            variant: 'destructive',
          });
        }
      }
    },
    [asyncFn, onSuccess, onError, toastOnError, retryCount, retryDelay, toast],
  );

  useEffect(() => {
    if (autoExecute: unknown) {
      execute();
    }
  }, [autoExecute, execute]);

  return {
    ...state,
    execute,
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
  };
}
