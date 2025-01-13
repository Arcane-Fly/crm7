import { supabase } from './client'
import { Database } from '../types/database'

type Tables = Database['public']['Tables']

// Time entries
export async function getTimeEntries(employeeId: string) {
  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .eq('employee_id', employeeId)
    .order('start_time', { ascending: false })

  if (error) throw error
  return data
}

export async function createTimeEntry(entry: Tables['time_entries']['Insert']) {
  const { data, error } = await supabase
    .from('time_entries')
    .insert(entry)
    .select()
    .single()

  if (error) throw error
  return data
}

// Documents
export async function uploadDocument(
  document: Tables['documents']['Insert'],
  file: File
) {
  // First upload the file to storage
  const { data: fileData, error: uploadError } = await supabase
    .storage
    .from('documents')
    .upload(`${document.created_by}/${file.name}`, file)

  if (uploadError) throw uploadError

  // Then create the document record
  const { data, error } = await supabase
    .from('documents')
    .insert({
      ...document,
      file_path: fileData.path,
      size_bytes: file.size,
      mime_type: file.type
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Quotes
export async function getQuotes(userId: string) {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .or(`client_id.eq.${userId},metadata->created_by.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createQuote(quote: Tables['quotes']['Insert']) {
  const { data, error } = await supabase
    .from('quotes')
    .insert(quote)
    .select()
    .single()

  if (error) throw error
  return data
}

// Email templates
export async function getEmailTemplate(name: string) {
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
  const { data, error } = await supabase
    .from('reports')
    .insert(report)
    .select()
    .single()

  if (error) throw error
  return data
}

// Integration logs
export async function logIntegration(
  type: string,
  status: string,
  message: string,
  metadata: any = {}
) {
  const { error } = await supabase
    .from('integration_logs')
    .insert({
      integration_type: type,
      status,
      message,
      metadata: {
        ...metadata,
        user_id: supabase.auth.getUser() // Add current user ID
      }
    })

  if (error) throw error
}
