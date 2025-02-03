import { type SupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';
import { BaseService } from './base-service';

interface FairWorkTemplate {
  id: string;
  name: string;
  baseRate: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

export class FairWorkService extends BaseService {
  constructor(private readonly supabase: SupabaseClient<Database>) {
    super({
      name: 'FairWorkService',
      version: '1.0.0',
    });
  }

  async getTemplates(): Promise<FairWorkTemplate[]> {
    return this.executeServiceMethod('getTemplates', async () => {
      const { data, error } = await this.supabase
        .from('fairwork_templates')
        .select();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  async getTemplate(id: string): Promise<FairWorkTemplate | null> {
    return this.executeServiceMethod('getTemplate', async () => {
      const { data, error } = await this.supabase
        .from('fairwork_templates')
        .select()
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  async createTemplate(template: Omit<FairWorkTemplate, 'id'>): Promise<FairWorkTemplate> {
    return this.executeServiceMethod('createTemplate', async () => {
      const { data, error } = await this.supabase
        .from('fairwork_templates')
        .insert(template)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  async updateTemplate(id: string, updates: Partial<FairWorkTemplate>): Promise<FairWorkTemplate> {
    return this.executeServiceMethod('updateTemplate', async () => {
      const { data, error } = await this.supabase
        .from('fairwork_templates')
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

  async getRates(params: {
    template_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<FairWorkTemplate[]> {
    return this.executeServiceMethod('getRates', async () => {
      let query = this.supabase.from('fairwork_templates').select();

      if (params.template_id) {
        query = query.eq('id', params.template_id);
      }

      if (params.start_date) {
        query = query.gte('effectiveFrom', params.start_date);
      }

      if (params.end_date) {
        query = query.lte('effectiveTo', params.end_date);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    });
  }
}
