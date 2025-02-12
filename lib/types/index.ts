export interface User {
  id: string;
  email?: string;
  org_id: string;
  // Add other user properties as needed
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export * from './api';
export * from './dashboard';
export * from './database';
export * from './documents';
export * from './expenses';
export * from './funding';
export * from './hr';
export * from './invoice';
export * from './lms';
export * from './logger';
export * from './monitoring';
export * from './rates';
export * from './supabase';
export * from './time';
export * from './validation';

// Re-export database types
export type { SupabaseClient } from '@supabase/supabase-js';
export type { Database } from './database';
