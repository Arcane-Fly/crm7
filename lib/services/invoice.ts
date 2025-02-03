import { type SupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';
import * as XLSX from 'xlsx';
import { BaseService } from './base-service';

interface Invoice {
  id: string;
  amount: number;
  description: string;
  date: string;
  status: 'draft' | 'pending' | 'paid' | 'cancelled';
  timesheets?: string[];
}

interface TimesheetImport {
  employeeId: string;
  date: string;
  hours: number;
  rate: number;
}

export class InvoiceService extends BaseService {
  constructor(private readonly supabase: SupabaseClient<Database>) {
    super({
      name: 'InvoiceService',
      version: '1.0.0',
    });
  }

  async getInvoices(params: {
    status?: Invoice['status'];
    start_date?: string;
    end_date?: string;
  }): Promise<Invoice[]> {
    return this.executeServiceMethod('getInvoices', async () => {
      let query = this.supabase.from('invoices').select();

      if (params.status) {
        query = query.eq('status', params.status);
      }

      if (params.start_date) {
        query = query.gte('date', params.start_date);
      }

      if (params.end_date) {
        query = query.lte('date', params.end_date);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    });
  }

  async getInvoice(id: string): Promise<Invoice | null> {
    return this.executeServiceMethod('getInvoice', async () => {
      const { data, error } = await this.supabase
        .from('invoices')
        .select()
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'status'>): Promise<Invoice> {
    return this.executeServiceMethod('createInvoice', async () => {
      const { data, error } = await this.supabase
        .from('invoices')
        .insert({
          ...invoice,
          status: 'draft',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    return this.executeServiceMethod('updateInvoice', async () => {
      const { data, error } = await this.supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  async importTimesheets(file: File): Promise<TimesheetImport[]> {
    return this.executeServiceMethod('importTimesheets', async () => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            if (!data) {
              throw new Error('No data read from file');
            }

            const workbook = XLSX.read(data, { type: 'binary' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawData = XLSX.utils.sheet_to_json(worksheet);

            if (!Array.isArray(rawData)) {
              throw new Error('Invalid timesheet data format');
            }

            const isValidTimesheetImport = (row: unknown): row is TimesheetImport => {
              return typeof row === 'object' && row !== null &&
                'employeeId' in row && typeof row.employeeId === 'string' &&
                'date' in row && typeof row.date === 'string' &&
                'hours' in row && typeof row.hours === 'number' &&
                'rate' in row && typeof row.rate === 'number';
            };

            const timesheets = rawData.filter(isValidTimesheetImport);
            resolve(timesheets);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
      });
    });
  }

  async deleteInvoice(id: string): Promise<void> {
    return this.executeServiceMethod('deleteInvoice', async () => {
      const { error } = await this.supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    });
  }

  async markAsPaid(id: string): Promise<Invoice> {
    return this.executeServiceMethod('markAsPaid', async () => {
      const { data, error } = await this.supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  async markAsCancelled(id: string): Promise<Invoice> {
    return this.executeServiceMethod('markAsCancelled', async () => {
      const { data, error } = await this.supabase
        .from('invoices')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  async getInvoicesByStatus(status: Invoice['status']): Promise<Invoice[]> {
    return this.executeServiceMethod('getInvoicesByStatus', async () => {
      const { data, error } = await this.supabase
        .from('invoices')
        .select()
        .eq('status', status);

      if (error) {
        throw error;
      }

      return data;
    });
  }
}
