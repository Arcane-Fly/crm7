export interface User {
  id: string;
  email?: string;
  org_id: string;
  // Add other user properties as needed
}

export * from './bank';
export * from './billing';
export * from './hr';
export * from './monitoring'; // Re-export monitoring types
export * from './rates';
export * from './validation';

// Re-export database types
export type { SupabaseClient } from '@supabase/supabase-js';
export type { Database } from './database';
