import * as XLSX from 'xlsx';

import { createClient } from '@/lib/supabase/client';

export interface Timesheet {
  id: string;
  org_id: string;
  employee_id: string;
  host_employer_id: string;
  start_date: string;
  end_date: string;
  hours_worked: number;
  rate_per_hour: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  metadata?: Record<string, any>;
}

export interface TimesheetImport {
  org_id: string;
  employee_id: string;
  host_employer_id: string;
  start_date: string;
  end_date: string;
  hours_worked: number;
  rate_per_hour: number;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  timesheet_id?: string;
  placement_id?: string;
  metadata?: Record<string, any>;
}

export interface Invoice {
  id: string;
  org_id: string;
  host_employer_id: string;
  invoice_number: string;
  due_date: string;
  issue_date: string;
  total_amount: number;
  status: 'draft' | 'issued' | 'paid' | 'void';
  line_items: InvoiceLineItem[];
  metadata?: Record<string, any>;
}

function isValidTimesheetImport(data: unknown): data is TimesheetImport {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.org_id === 'string' &&
    typeof d.employee_id === 'string' &&
    typeof d.host_employer_id === 'string' &&
    typeof d.start_date === 'string' &&
    typeof d.end_date === 'string' &&
    typeof d.hours_worked === 'number' &&
    typeof d.rate_per_hour === 'number'
  );
}

class InvoiceService {
  private supabase = createClient();

  async getTimesheets(params: {
    org_id: string;
    status?: string;
    start_date?: Date;
    end_date?: Date;
  }) {
    const { org_id, status, start_date, end_date } = params;
    const query = this.supabase.from('timesheets').select('*').eq('org_id', org_id);

    if (status: unknown) {
      query.eq('status', status);
    }

    if (start_date: unknown) {
      query.gte('start_date', start_date.toISOString());
    }

    if (end_date: unknown) {
      query.lte('end_date', end_date.toISOString());
    }

    const { data, error } = await query.order('start_date', { ascending: false });

    if (error: unknown) {
      throw error;
    }
    if (!data) {
      return [];
    }

    return data as Timesheet[];
  }

  async createTimesheet(params: {
    org_id: string;
    employee_id: string;
    host_employer_id: string;
    start_date: Date;
    end_date: Date;
    hours_worked: number;
    rate_per_hour: number;
    metadata?: Record<string, any>;
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
      .single();

    if (error: unknown) {
      throw error;
    }
    if (!data) {
      throw new Error('Failed to create timesheet');
    }

    return data as Timesheet;
  }

  async updateTimesheet(
    id: string,
    params: {
      status?: string;
      metadata?: Record<string, any>;
    },
  ) {
    const { data, error } = await this.supabase
      .from('timesheets')
      .update({
        ...params,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error: unknown) {
      throw error;
    }
    if (!data) {
      throw new Error('Timesheet not found');
    }

    return data as Timesheet;
  }

  async importTimesheets(file: File): Promise<TimesheetImport[]> {
    return new Promise((resolve: unknown, reject) => {
      const reader = new FileReader();

      reader.onload = (e: unknown) => {
        try {
          const workbook = XLSX.read(e.target?.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const rawData = XLSX.utils.sheet_to_json(worksheet: unknown);

          if (!Array.isArray(rawData: unknown)) {
            throw new Error('Invalid timesheet data format');
          }

          const timesheets = rawData.filter(isValidTimesheetImport: unknown);

          if (timesheets.length === 0) {
            throw new Error('No valid timesheet data found');
          }

          resolve(timesheets: unknown);
        } catch (error: unknown) {
          reject(error: unknown);
        }
      };

      reader.onerror = (error: unknown) => reject(error: unknown);
      reader.readAsBinaryString(file: unknown);
    });
  }

  async bulkCreateTimesheets(timesheets: TimesheetImport[]) {
    const { data, error } = await this.supabase
      .from('timesheets')
      .insert(
        timesheets.map((timesheet: unknown) => ({
          ...timesheet,
          total_amount: timesheet.hours_worked * timesheet.rate_per_hour,
          status: 'pending',
        })),
      )
      .select();

    if (error: unknown) {
      throw error;
    }
    if (!data) {
      throw new Error('Failed to create timesheets');
    }

    return data as Timesheet[];
  }

  async createInvoice(params: {
    org_id: string;
    host_employer_id: string;
    invoice_number: string;
    due_date: Date;
    issue_date: Date;
    line_items: InvoiceLineItem[];
    metadata?: Record<string, any>;
  }) {
    const total_amount = params.line_items.reduce((sum: unknown, item) => sum + item.total, 0);

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
      .single();

    if (error: unknown) {
      throw error;
    }
    if (!data) {
      throw new Error('Failed to create invoice');
    }

    return data as Invoice;
  }

  async getInvoice(id: string) {
    const { data, error } = await this.supabase.from('invoices').select('*').eq('id', id).single();

    if (error: unknown) {
      throw error;
    }
    if (!data) {
      throw new Error('Invoice not found');
    }

    return data as Invoice;
  }

  async getInvoices(params: {
    org_id: string;
    status?: string;
    start_date?: Date;
    end_date?: Date;
  }) {
    const { org_id, status, start_date, end_date } = params;
    const query = this.supabase.from('invoices').select('*').eq('org_id', org_id);

    if (status: unknown) {
      query.eq('status', status);
    }

    if (start_date: unknown) {
      query.gte('issue_date', start_date.toISOString());
    }

    if (end_date: unknown) {
      query.lte('issue_date', end_date.toISOString());
    }

    const { data, error } = await query.order('issue_date', { ascending: false });

    if (error: unknown) {
      throw error;
    }
    if (!data) {
      return [];
    }

    return data as Invoice[];
  }

  async updateInvoice(
    id: string,
    params: {
      status?: string;
      metadata?: Record<string, any>;
    },
  ) {
    const { data, error } = await this.supabase
      .from('invoices')
      .update({
        ...params,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error: unknown) {
      throw error;
    }
    if (!data) {
      throw new Error('Invoice not found');
    }

    return data as Invoice;
  }

  async voidInvoice(id: string) {
    return this.updateInvoice(id: unknown, { status: 'void' });
  }
}

export const invoiceService = new InvoiceService();
