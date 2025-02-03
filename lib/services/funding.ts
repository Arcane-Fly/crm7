import { type SupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';
import { BaseService } from './base-service';

interface FundingEntry {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export class FundingService extends BaseService {
  constructor(private readonly supabase: SupabaseClient<Database>) {
    super({
      name: 'FundingService',
      version: '1.0.0',
    });
  }

  async getFundingEntries(params: {
    status?: FundingEntry['status'];
    start_date?: string;
    end_date?: string;
  }): Promise<FundingEntry[]> {
    return this.executeServiceMethod('getFundingEntries', async () => {
      let query = this.supabase.from('funding_entries').select();

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

  async getFundingEntry(id: string): Promise<FundingEntry | null> {
    return this.executeServiceMethod('getFundingEntry', async () => {
      const { data, error } = await this.supabase
        .from('funding_entries')
        .select()
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  async createFundingEntry(entry: Omit<FundingEntry, 'id' | 'status'>): Promise<FundingEntry> {
    return this.executeServiceMethod('createFundingEntry', async () => {
      const { data, error } = await this.supabase
        .from('funding_entries')
        .insert({
          ...entry,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  async updateFundingEntry(id: string, updates: Partial<FundingEntry>): Promise<FundingEntry> {
    return this.executeServiceMethod('updateFundingEntry', async () => {
      const { data, error } = await this.supabase
        .from('funding_entries')
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

  async deleteFundingEntry(id: string): Promise<void> {
    return this.executeServiceMethod('deleteFundingEntry', async () => {
      const { error } = await this.supabase
        .from('funding_entries')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    });
  }
}
