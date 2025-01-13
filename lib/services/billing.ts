import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export interface Timesheet {
  id: string
  employee_id: string
  host_employer_id: string
  rate_template_id: string
  start_date: Date
  end_date: Date
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'billed'
  total_hours: number
  regular_hours: number
  overtime_hours: number
  break_hours: number
  allowances: any[]
  penalties: any[]
  notes?: string
  submitted_at?: Date
  approved_at?: Date
  approved_by?: string
  metadata?: Record<string, any>
}

export interface TimesheetEntry {
  id: string
  timesheet_id: string
  date: Date
  start_time: string
  end_time: string
  break_duration: number
  work_type: string
  description?: string
  metadata?: Record<string, any>
}

export interface Invoice {
  id: string
  host_employer_id: string
  billing_period_start: Date
  billing_period_end: Date
  status: 'draft' | 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  due_date: Date
  subtotal: number
  tax_amount: number
  total_amount: number
  notes?: string
  metadata?: Record<string, any>
}

export interface BillingSettings {
  id: string
  org_id: string
  billing_frequency: 'weekly' | 'fortnightly' | 'monthly'
  payment_terms: number
  auto_generate_invoices: boolean
  auto_send_invoices: boolean
  tax_rate: number
  invoice_template?: Record<string, any>
  notification_settings?: Record<string, any>
  metadata?: Record<string, any>
}

export class BillingService {
  private supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Timesheet Management
  async createTimesheet(timesheet: Omit<Timesheet, 'id'>): Promise<Timesheet> {
    const { data, error } = await this.supabase
      .from('timesheets')
      .insert(timesheet)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async addTimesheetEntry(entry: Omit<TimesheetEntry, 'id'>): Promise<TimesheetEntry> {
    const { data, error } = await this.supabase
      .from('timesheet_entries')
      .insert(entry)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async submitTimesheet(timesheetId: string): Promise<void> {
    const { error } = await this.supabase
      .from('timesheets')
      .update({
        status: 'submitted',
        submitted_at: new Date().toISOString()
      })
      .eq('id', timesheetId)

    if (error) throw error
  }

  async approveTimesheet(timesheetId: string, approverId: string): Promise<void> {
    const { error } = await this.supabase
      .from('timesheets')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: approverId
      })
      .eq('id', timesheetId)

    if (error) throw error
  }

  // Billing Management
  async getBillingSettings(orgId: string): Promise<BillingSettings> {
    const { data, error } = await this.supabase
      .from('billing_settings')
      .select()
      .eq('org_id', orgId)
      .single()

    if (error) throw error
    return data
  }

  async generateInvoice(hostEmployerId: string, startDate: Date, endDate: Date): Promise<Invoice> {
    const { data, error } = await this.supabase
      .rpc('generate_invoice', {
        p_host_employer_id: hostEmployerId,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString()
      })
      .single()

    if (error) throw error
    return data
  }

  async processAutomaticBilling(): Promise<void> {
    // Get all organizations with auto-billing enabled
    const { data: billingSettings, error } = await this.supabase
      .from('billing_settings')
      .select()
      .eq('auto_generate_invoices', true)

    if (error) throw error

    const now = new Date()

    for (const settings of billingSettings) {
      let startDate: Date
      let endDate: Date

      // Determine billing period based on frequency
      switch (settings.billing_frequency) {
        case 'weekly':
          startDate = startOfWeek(now)
          endDate = endOfWeek(now)
          break
        case 'fortnightly':
          startDate = startOfWeek(now)
          endDate = endOfWeek(addDays(now, 13))
          break
        case 'monthly':
          startDate = startOfMonth(now)
          endDate = endOfMonth(now)
          break
      }

      // Generate invoice
      await this.generateInvoice(settings.org_id, startDate, endDate)

      // Send invoice if auto-send is enabled
      if (settings.auto_send_invoices) {
        // TODO: Implement invoice sending logic
      }
    }
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    const { data, error } = await this.supabase
      .from('invoices')
      .select(`
        *,
        line_items:invoice_line_items(*)
      `)
      .eq('id', invoiceId)
      .single()

    if (error) throw error
    return data
  }

  async updateInvoiceStatus(invoiceId: string, status: Invoice['status']): Promise<void> {
    const { error } = await this.supabase
      .from('invoices')
      .update({ status })
      .eq('id', invoiceId)

    if (error) throw error
  }
}

export const billingService = new BillingService()
