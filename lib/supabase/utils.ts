import { supabase } from './client';

export async function getTimeEntries() {
  const { data, error } = await supabase.from('time_entries').select('*');

  if (error) throw error;
  return data;
}

export async function createTimeEntry(entry: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('time_entries')
    .insert(entry)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadDocument(file: File) {
  const { data, error } = await supabase.storage.from('documents').upload(file.name, file);

  if (error) throw error;
  return data;
}

export async function getQuotes() {
  const { data, error } = await supabase.from('quotes').select('*');

  if (error) throw error;
  return data;
}

export async function createQuote(quote: Record<string, unknown>) {
  const { data, error } = await supabase.from('quotes').insert(quote).select().single();

  if (error) throw error;
  return data;
}

export async function getEmailTemplate(templateId: string) {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (error) throw error;
  return data;
}

export async function scheduleReport(reportConfig: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('scheduled_reports')
    .insert(reportConfig)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function logIntegrationEvent(event: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('integration_events')
    .insert(event)
    .select()
    .single();

  if (error) throw error;
  return data;
}
