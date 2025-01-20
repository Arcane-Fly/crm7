'use server'

import { createClient } from './server'
import type { Database } from '../types/database'

type Tables = Database['public']['Tables']

// Time entries
export async function getTimeEntries(employeeId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .eq('employee_id', employeeId)
    .order('start_time', { ascending: false })

  if (error) throw error
  return data
}

export async function createTimeEntry(entry: Tables['time_entries']['Insert']) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('time_entries').insert(entry).select().single()

  if (error) throw error
  return data
}

// Documents
export async function uploadDocument(
  document: Tables['documents']['Insert'] & { userId: string },
  file: File
) {
  const supabase = await createClient()
  // First upload the file to storage
  const { data: fileData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(`${document.userId}/${file.name}`, file)

  if (uploadError) throw uploadError

  // Then create the document record
  const { data, error } = await supabase
    .from('documents')
    .insert({
      ...document,
      file_path: fileData.path,
      created_by: document.userId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Quotes
export async function getQuotes(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createQuote(quote: Tables['quotes']['Insert']) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('quotes').insert(quote).select().single()

  if (error) throw error
  return data
}

// Email templates
export async function getEmailTemplate(name: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('name', name)
    .single()

  if (error) throw error
  return data
}

// Reports
export async function scheduleReport(report: Tables['reports']['Insert']) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('reports').insert(report).select().single()

  if (error) throw error
  return data
}

// Integration logs
export async function logIntegrationEvent(
  integration: string,
  event: string,
  message: string,
  metadata: any = {}
) {
  const supabase = await createClient()
  const { error } = await supabase.from('integration_logs').insert({
    integration,
    event,
    message,
    metadata,
  })

  if (error) throw error
}

export async function getServerSession() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}
