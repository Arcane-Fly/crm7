import { supabase } from './client';

export async function getTimeEntries(): Promise<Error> {
  const { data, error } = await supabase.from('time_entries').select('*');
  if (error) throw error;
  return data;
}

// ... other functions ...

// Add a stub for getServerSession so server components can compile
export async function getServerSession(): Promise<Error> {
  // This stub should be replaced with the proper session retrieval logic.
  return null;
}
