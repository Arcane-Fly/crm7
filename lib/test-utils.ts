import type { PostgrestError } from '@supabase/supabase-js';

export class PostgrestErrorType implements PostgrestError {
  message: string;
  details: string;
  hint: string;
  code: string;

  constructor(message: string) {
    this.message = message;
    this.details = '';
    this.hint = '';
    this.code = 'ERROR';
  }
}

export function createMockQueryResult<T>({
  data,
  error,
  isLoading,
}: {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
}) {
  return {
    data,
    error,
    isLoading,
    isSuccess: !error && !isLoading,
    status: error ? 'error' : isLoading ? 'loading' : 'success',
  };
}
