import { type SupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';
import { BaseService } from './base-service';

interface Timesheet {
  id: string;
  employeeId: string;
  date: string;
  hours: number;
  rate: number;
}

interface BillingEntry {
  id: string;
  timesheetId: string;
  amount: number;
  status: 'pending' | 'processed' | 'paid';
}

export class BillingService extends BaseService {
  constructor(
    private readonly supabase: SupabaseClient<Database>
  ) {
    super({
      name: 'BillingService',
      version: '1.0.0',
    });
  }

  async createTimesheet(timesheet: Omit<Timesheet, 'id'>): Promise<Timesheet> {
    return this.executeServiceMethod('createTimesheet', async () => {
      const { data, error } = await this.supabase
        .from('timesheets')
        .insert(timesheet)
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  }

  async createBillingEntry(entry: Omit<BillingEntry, 'id'>): Promise<BillingEntry> {
    return this.executeServiceMethod('createBillingEntry', async () => {
      const { data, error } = await this.supabase
        .from('billing_entries')
        .insert(entry)
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  }

  async getBillingEntries(status?: BillingEntry['status']): Promise<BillingEntry[]> {
    return this.executeServiceMethod('getBillingEntries', async () => {
      const query = this.supabase.from('billing_entries').select();

      if (status) {
        query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    });
  }

  async processBillingEntry(id: string): Promise<BillingEntry> {
    return this.executeServiceMethod('processBillingEntry', async () => {
      const { data, error } = await this.supabase
        .from('billing_entries')
        .update({ status: 'processed' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  }

  async markBillingEntryAsPaid(id: string): Promise<BillingEntry> {
    return this.executeServiceMethod('markBillingEntryAsPaid', async () => {
      const { data, error } = await this.supabase
        .from('billing_entries')
        .update({ status: 'paid' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  }
}
