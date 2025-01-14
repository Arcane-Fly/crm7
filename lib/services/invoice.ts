import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'
import * as XLSX from 'xlsx'

export interface Timesheet {
  id: string
  org_id: string
  employee_id: string
  host_employer_id: string
  start_date: string
  end_date: string
  hours_worked: number
  rate_per_hour: number
  total_amount: number
  status: 'pending' | 'approved' | 'rejected'
  metadata?: Record<string, any>
}

export interface TimesheetImport {
  org_id: string
  employee_id: string
  host_employer_id: string
  start_date: string
  end_date: string
  hours_worked: number
  rate_per_hour: number
}

export interface InvoiceLineItem {
  description: string
  quantity: number
  unit_price: number
  total: number
  timesheet_id?: string
  placement_id?: string
  metadata?: Record<string, any>
}

export interface Invoice {
  id: string
  org_id: string
  host_employer_id: string
  invoice_number: string
  due_date: string
  issue_date: string
  total_amount: number
  status: 'draft' | 'issued' | 'paid' | 'void'
  line_items: InvoiceLineItem[]
  metadata?: Record<string, any>
}

class InvoiceService {
  private supabase = createClient<Database>()

  async getTimesheets(params: {
    org_id: string
    status?: string
    start_date?: Date
    end_date?: Date
  }) {
    const { org_id, status, start_date, end_date } = params
    const query = this.supabase
      .from('timesheets')
      .select('*')
      .eq('org_id', org_id)

    if (status) {
      query.eq('status', status)
    }

    if (start_date) {
      query.gte('start_date', start_date.toISOString())
    }

    if (end_date) {
      query.lte('end_date', end_date.toISOString())
    }

    const { data, error } = await query.order('start_date', { ascending: false })

    if (error) {
      throw error
    }

    return data as Timesheet[]
  }

  async createTimesheet(params: {
    org_id: string
    employee_id: string
    host_employer_id: string
    start_date: Date
    end_date: Date
    hours_worked: number
    rate_per_hour: number
    metadata?: Record<string, any>
  }) {
    const { data, error } = await this.supabase
      .from('timesheets')
      .insert({
        ...params,
        start_date: params.start_date.toISOString(),
        end_date: params.end_date.toISOString(),
        total_amount: params.hours_worked * params.rate_per_hour,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as Timesheet
  }

  async updateTimesheet(id: string, params: {
    status?: string
    metadata?: Record<string, any>
  }) {
    const { data, error } = await this.supabase
      .from('timesheets')
      .update({
        ...params,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as Timesheet
  }

  async importTimesheets(file: File): Promise<TimesheetImport[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target?.result, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const timesheets = XLSX.utils.sheet_to_json(worksheet) as TimesheetImport[]
          resolve(timesheets)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = (error) => reject(error)
      reader.readAsBinaryString(file)
    })
  }

  async bulkCreateTimesheets(timesheets: TimesheetImport[]) {
    const { data, error } = await this.supabase
      .from('timesheets')
      .insert(timesheets.map(timesheet => ({
        ...timesheet,
        total_amount: timesheet.hours_worked * timesheet.rate_per_hour,
        status: 'pending',
      })))
      .select()

    if (error) {
      throw error
    }

    return data as Timesheet[]
  }

  async createInvoice(params: {
    org_id: string
    host_employer_id: string
    invoice_number: string
    due_date: Date
    issue_date: Date
    line_items: InvoiceLineItem[]
    metadata?: Record<string, any>
  }) {
    const total_amount = params.line_items.reduce((sum, item) => sum + item.total, 0)

    const { data, error } = await this.supabase
      .from('invoices')
      .insert({
        ...params,
        due_date: params.due_date.toISOString(),
        issue_date: params.issue_date.toISOString(),
        total_amount,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as Invoice
  }

  async getInvoice(id: string) {
    const { data, error } = await this.supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return data as Invoice
  }

  async getInvoices(params: {
    org_id: string
    status?: string
    start_date?: Date
    end_date?: Date
  }) {
    const { org_id, status, start_date, end_date } = params
    const query = this.supabase
      .from('invoices')
      .select('*')
      .eq('org_id', org_id)

    if (status) {
      query.eq('status', status)
    }

    if (start_date) {
      query.gte('issue_date', start_date.toISOString())
    }

    if (end_date) {
      query.lte('issue_date', end_date.toISOString())
    }

    const { data, error } = await query.order('issue_date', { ascending: false })

    if (error) {
      throw error
    }

    return data as Invoice[]
  }

  async updateInvoice(id: string, params: {
    status?: string
    metadata?: Record<string, any>
  }) {
    const { data, error } = await this.supabase
      .from('invoices')
      .update({
        ...params,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as Invoice
  }

  async voidInvoice(id: string) {
    return this.updateInvoice(id, { status: 'void' })
  }
}

export const invoiceService = new InvoiceService()
