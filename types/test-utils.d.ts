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
    this.code = 'TEST_ERROR';
  }
}

export interface MockQueryResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export function createMockQueryResult<T>(params: {
  data?: T;
  error?: Error | null;
  isLoading?: boolean;
}): MockQueryResult<T> {
  return {
    data: params.data ?? null,
    error: params.error ?? null,
    isLoading: params.isLoading ?? false
  };
}
