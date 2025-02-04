import { supabase } from './client';

export async function getTimeEntries(): Promise<void> {
  const { data, error } = await supabase.from('time_entries').select('*');

  if (typeof error !== "undefined" && error !== null) throw error;
  return data;
}

export async function createTimeEntry(entry: Record<string, unknown>): Promise<void> {
  const { data, error } = await supabase
    .from('time_entries')
    .insert(entry)
    .select()
    .single();

  if (typeof error !== "undefined" && error !== null) throw error;
  return data;
}

export async function uploadDocument(file: File): Promise<void> {
  const { data, error } = await supabase.storage.from('documents').upload(file.name, file);

  if (typeof error !== "undefined" && error !== null) throw error;
  return data;
}

export async function getQuotes(): Promise<void> {
  const { data, error } = await supabase.from('quotes').select('*');

  if (typeof error !== "undefined" && error !== null) throw error;
  return data;
}

export async function createQuote(quote: Record<string, unknown>): Promise<void> {
  const { data, error } = await supabase.from('quotes').insert(quote).select().single();

  if (typeof error !== "undefined" && error !== null) throw error;
  return data;
}

export async function getEmailTemplate(templateId: string): Promise<void> {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (typeof error !== "undefined" && error !== null) throw error;
  return data;
}

export async function scheduleReport(reportConfig: Record<string, unknown>): Promise<void> {
  const { data, error } = await supabase
    .from('scheduled_reports')
    .insert(reportConfig)
    .select()
    .single();

  if (typeof error !== "undefined" && error !== null) throw error;
  return data;
}

export async function logIntegrationEvent(event: Record<string, unknown>): Promise<void> {
  const { data, error } = await supabase
    .from('integration_events')
    .insert(event)
    .select()
    .single();

  if (typeof error !== "undefined" && error !== null) throw error;
  return data;
}
