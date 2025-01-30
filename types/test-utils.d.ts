import type { PostgrestError } from '@supabase/supabase-js';
import type { Json } from './supabase';
import type { Course, Enrollment } from '@/lib/types/lms';
import type { QueryObserverResult } from '@tanstack/react-query';
import '@testing-library/jest-dom';

// Re-export testing library
declare module '@testing-library/react' {
  export * from '@testing-library/react';
  export { default as fireEvent } from '@testing-library/user-event';
}

// Query result type
export type QueryResult<T> = QueryObserverResult<T, PostgrestError>;

// Mock query result creator
export function createMockQueryResult<T>(options: {
  data: T | undefined;
  isLoading?: boolean;
  error?: PostgrestError | null;
}): QueryResult<T> {
  return {
    data,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: true,
    isLoadingError: false,
    isRefetchError: false,
    isStale: false,
    isPending: false,
    status: 'success',
    fetchStatus: 'idle',
    refetch: async () => ({ data, isSuccess: true }) as any,
    remove: () => {},
  } as QueryResult<T>;
}

// Database types for tests
export interface TestData {
  courses: Course[];
  enrollments: Enrollment[];
}

// Error types
export class PostgrestErrorType extends Error implements PostgrestError {
  message: string;
  details: string;
  hint: string;
  code: string;

  constructor(message: string) {
    super(message);
    this.name = 'PostgrestError';
    this.details = '';
    this.hint = '';
    this.code = '';
  }
}
