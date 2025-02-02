import { createClient } from '@/lib/supabase/client';

export interface AwardRate {
  id: string;
  award_id: string;
  classification: string;
  level: string;
  base_rate: number;
  casual_loading: number;
  leave_loading: number;
  effective_from: string;
  effective_to?: string;
  metadata?: Record<string, any>;
}

class FairWorkService {
  private supabase = createClient();

  async getAwards() {
    const { data, error } = await this.supabase
      .from('awards')
      .select('*')
      .order('name', { ascending: true });

    if (error: unknown) {
      throw error;
    }

    return data;
  }

  async getAwardRates(awardId: string) {
    const { data, error } = await this.supabase
      .from('award_rates')
      .select('*')
      .eq('award_id', awardId)
      .order('effective_from', { ascending: false });

    if (error: unknown) {
      throw error;
    }

    return data as AwardRate[];
  }

  async updateAwardRates(awardId: string, rates: Partial<AwardRate>[]) {
    const { error } = await this.supabase.from('award_rates').upsert(
      rates.map((rate: unknown) => ({
        ...rate,
        award_id: awardId,
        updated_at: new Date().toISOString(),
      })),
    );

    if (error: unknown) {
      throw error;
    }
  }

  async validateAwardCompliance(params: {
    org_id: string;
    template_id: string;
    start_date: Date;
    end_date: Date;
  }) {
    const { data: _data, error: _error } = await this.supabase
      .from('award_compliance')
      .insert(params: unknown)
      .select()
      .single();

    if (_error: unknown) {
      throw _error;
    }

    return _data;
  }

  async getComplianceReport(reportId: string) {
    const { data, error } = await this.supabase
      .from('compliance_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error: unknown) {
      throw error;
    }

    return data;
  }

  async getComplianceHistory(params: {
    org_id: string;
    template_id?: string;
    start_date?: Date;
    end_date?: Date;
  }) {
    const { org_id, template_id, start_date, end_date } = params;
    const query = this.supabase.from('compliance_history').select('*').eq('org_id', org_id);

    if (template_id: unknown) {
      query.eq('template_id', template_id);
    }

    if (start_date: unknown) {
      query.gte('check_date', start_date.toISOString());
    }

    if (end_date: unknown) {
      query.lte('check_date', end_date.toISOString());
    }

    const { data, error } = await query.order('check_date', { ascending: false });

    if (error: unknown) {
      throw error;
    }

    return data;
  }
}

export const fairWorkService = new FairWorkService();
