import { createClient } from '@supabase/supabase-js';
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

import { logger } from '@/lib/services/logger';
import type { Database } from '@/types/supabase';

export interface Timesheet {
  id: string;
  employee_id: string;
  host_employer_id: string;
  rate_template_id: string;
  start_date: Date;
  end_date: Date;
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'billed';
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  break_hours: number;
  allowances: any[];
  penalties: any[];
  notes?: string;
  submitted_at?: Date;
  approved_at?: Date;
  approved_by?: string;
  metadata?: Record<string, any>;
}

export interface TimesheetEntry {
  id: string;
  timesheet_id: string;
  date: Date;
  start_time: string;
  end_time: string;
  break_duration: number;
  work_type: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface Invoice {
  id: string;
  org_id: string;
  invoice_number: string;
  amount: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  issued_date: string;
  paid_date?: string;
  metadata?: Record<string, any>;
}

export interface BillingCycle {
  id: string;
  org_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

export interface BillingSettings {
  id: string;
  org_id: string;
  billing_frequency: 'weekly' | 'fortnightly' | 'monthly';
  payment_terms: number;
  auto_generate_invoices: boolean;
  auto_send_invoices: boolean;
  tax_rate: number;
  invoice_template?: Record<string, any>;
  notification_settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface InvoiceStats {
  // Add properties for invoice stats
}

export interface CreateInvoiceParams {
  org_id: string;
  invoice_number: string;
  amount: number;
  issue_date: Date;
  due_date?: Date; // Make due_date optional
  payment_terms?: number; // Add payment terms
  metadata?: Record<string, any>;
}

export class BillingService {
  private supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // Timesheet Management
  async createTimesheet(timesheet: Omit<Timesheet, 'id'>): Promise<Timesheet> {
    const { data, error } = await this.supabase
      .from('timesheets')
      .insert(timesheet)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create timesheet');
    return data as Timesheet;
  }

  async addTimesheetEntry(entry: Omit<TimesheetEntry, 'id'>): Promise<TimesheetEntry> {
    const { data, error } = await this.supabase
      .from('timesheet_entries')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create timesheet entry');
    return data as TimesheetEntry;
  }

  async submitTimesheet(timesheetId: string): Promise<void> {
    const { error } = await this.supabase
      .from('timesheets')
      .update({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      })
      .eq('id', timesheetId);

    if (error) throw error;
  }

  async approveTimesheet(timesheetId: string, approverId: string): Promise<void> {
    const { error } = await this.supabase
      .from('timesheets')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: approverId,
      })
      .eq('id', timesheetId);

    if (error) throw error;
  }

  // Billing Management
  async getBillingSettings(orgId: string): Promise<BillingSettings> {
    const { data, error } = await this.supabase
      .from('billing_settings')
      .select()
      .eq('org_id', orgId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Billing settings not found');
    return data as BillingSettings;
  }

  async generateInvoice(
    hostEmployerId: string,
    startDate: string,
    endDate: string,
  ): Promise<Invoice> {
    const { data, error } = await this.supabase
      .rpc('generate_invoice', {
        p_host_employer_id: hostEmployerId,
        p_start_date: startDate,
        p_end_date: endDate,
      })
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to generate invoice');
    return data as Invoice;
  }

  async processAutomaticBilling(): Promise<void> {
    // Get all organizations with auto-billing enabled
    const { data: billingSettings, error } = await this.supabase
      .from('billing_settings')
      .select()
      .eq('auto_generate_invoices', true);

    if (error) throw error;
    if (!billingSettings || billingSettings.length === 0) {
      logger.info('No organizations found with auto-billing enabled', {
        service: 'BillingService',
      });
      return;
    }

    for (const settings of billingSettings as BillingSettings[]) {
      try {
        // Initialize dates before using them
        let startDate: string;
        let endDate: string;

        if (settings.billing_frequency === 'monthly') {
          startDate = startOfMonth(new Date()).toISOString();
          endDate = endOfMonth(new Date()).toISOString();
        } else {
          startDate = startOfWeek(new Date()).toISOString();
          endDate = endOfWeek(new Date()).toISOString();
        }

        await this.generateInvoice(settings.org_id, startDate, endDate);

        // Send invoice if auto-send is enabled
        if (settings.auto_send_invoices) {
          // TODO: Implement invoice sending logic
        }
      } catch (err) {
        logger.error(
          `Failed to process billing for org ${settings.org_id}:`,
          err instanceof Error ? err : new Error(String(err)),
          { service: 'BillingService' },
        );
        // Continue processing other organizations even if one fails
      }
    }
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    const { data, error } = await this.supabase
      .from('invoices')
      .select(
        `
        *,
        line_items:invoice_line_items(*)
      `,
      )
      .eq('id', invoiceId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Invoice not found');
    return data as Invoice;
  }

  async updateInvoiceStatus(invoiceId: string, status: Invoice['status']): Promise<void> {
    const { error } = await this.supabase.from('invoices').update({ status }).eq('id', invoiceId);

    if (error) throw error;
  }

  async getBillingCycles(params: {
    org_id: string;
    start_date?: Date;
    end_date?: Date;
    status?: string;
  }) {
    const { org_id, start_date, end_date, status } = params;
    const query = this.supabase.from('billing_cycles').select('*').eq('org_id', org_id);

    if (start_date) {
      query.gte('start_date', start_date.toISOString());
    }

    if (end_date) {
      query.lte('end_date', end_date.toISOString());
    }

    if (status) {
      query.eq('status', status);
    }

    const { data, error } = await query.order('start_date', { ascending: false });

    if (error) {
      throw error;
    }

    return data as BillingCycle[];
  }

  async createBillingCycle(params: {
    org_id: string;
    start_date: Date;
    end_date: Date;
    status: string;
    metadata?: Record<string, any>;
  }) {
    const { data, error } = await this.supabase
      .from('billing_cycles')
      .insert({
        ...params,
        start_date: params.start_date.toISOString(),
        end_date: params.end_date.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as BillingCycle;
  }

  async updateBillingCycle(
    id: string,
    params: {
      status?: string;
      metadata?: Record<string, any>;
    },
  ) {
    const { data, error } = await this.supabase
      .from('billing_cycles')
      .update({
        ...params,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as BillingCycle;
  }

  async getInvoices(params: {
    org_id: string;
    status?: string;
    start_date?: Date;
    end_date?: Date;
  }) {
    const { org_id, status, start_date, end_date } = params;
    const query = this.supabase.from('invoices').select('*').eq('org_id', org_id);

    if (status) {
      query.eq('status', status);
    }

    if (start_date) {
      query.gte('issued_date', start_date.toISOString());
    }

    if (end_date) {
      query.lte('issued_date', end_date.toISOString());
    }

    const { data, error } = await query.order('issued_date', { ascending: false });

    if (error) {
      throw error;
    }

    return data as Invoice[];
  }

  async getInvoiceStats(params: { org_id: string; start_date?: string; end_date?: string }) {
    const { org_id, start_date, end_date } = params;
    const { data, error } = await this.supabase.rpc('get_invoice_stats', {
      p_org_id: org_id,
      p_start_date: start_date,
      p_end_date: end_date,
    });

    if (error) throw error;
    return data as InvoiceStats;
  }

  async createInvoice(invoice: CreateInvoiceParams): Promise<Invoice> {
    // Calculate due date based on payment terms if not provided
    let due_date = invoice.due_date;
    if (!due_date && invoice.payment_terms) {
      due_date = addDays(invoice.issue_date, invoice.payment_terms);
    } else if (!due_date) {
      // Default to 30 days if no due date or payment terms provided
      due_date = addDays(invoice.issue_date, 30);
    }

    const { data, error } = await this.supabase
      .from('invoices')
      .insert({
        ...invoice,
        issue_date: invoice.issue_date.toISOString(),
        due_date: due_date.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create invoice');
    return data as Invoice;
  }

  async updateInvoice(
    id: string,
    params: {
      status?: string;
      paid_date?: Date;
      metadata?: Record<string, any>;
    },
  ) {
    const { data, error } = await this.supabase
      .from('invoices')
      .update({
        ...params,
        paid_date: params.paid_date?.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Invoice;
  }
}

export const billingService = new BillingService();
