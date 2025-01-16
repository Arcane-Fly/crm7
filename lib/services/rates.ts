import { createClient } from '@/lib/supabase/client'

export interface RateTemplate {
  id: string
  org_id: string
  template_name: string
  template_type: 'apprentice' | 'trainee' | 'casual' | 'permanent' | 'contractor'
  base_rate: number
  base_margin: number
  super_rate: number
  leave_loading?: number
  workers_comp_rate: number
  payroll_tax_rate: number
  training_cost_rate?: number
  other_costs_rate?: number
  funding_offset?: number
  effective_from: string
  effective_to?: string
  is_active: boolean
  is_approved: boolean
  version_number: number
  rules: Record<string, any>
  metadata?: Record<string, any>
}

export interface RateCalculation {
  id?: string
  template_id: string
  base_rate: number
  super_amount: number
  margin_amount: number
  total_cost: number
  final_rate: number
  casual_loading?: number
  leave_loading_amount?: number
  training_cost_amount?: number
  other_costs_amount?: number
  funding_offset_amount?: number
}

export interface ValidationRule {
  field: keyof RateTemplate
  type: 'required' | 'min' | 'max'
  value?: number
}

export interface GetRateTemplatesParams {
  org_id: string
  is_active?: boolean
  status?: string
}

export interface AwardRate {
  id: string
  award_name: string
  rate_type: string
  base_rate: number
  effective_from: string
  effective_to?: string
  metadata?: Record<string, any>
}

export class RatesService {
  protected supabase = createClient()

  async getTemplates(params: GetRateTemplatesParams) {
    const { data, error } = await this.supabase
      .from('rate_templates')
      .select('*')
      .eq('org_id', params.org_id)
      .order('created_at', { ascending: false })

    if (error) throw error
    if (!data) return { data: [] }
    return { data }
  }

  async getRateTemplates(params: GetRateTemplatesParams) {
    return this.getTemplates(params)
  }

  async getTemplate(id: string) {
    const { data, error } = await this.supabase
      .from('rate_templates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) throw new Error('Rate template not found')
    return { data }
  }

  async getAwardRates(params: { org_id: string }) {
    const { data, error } = await this.supabase
      .from('award_rates')
      .select('*')
      .eq('org_id', params.org_id)
      .order('effective_from', { ascending: false })

    if (error) throw error
    if (!data) return { data: [] }
    return { data }
  }

  async getAnalytics(org_id: string) {
    const { data, error } = await this.supabase.rpc('generate_rate_analytics', { org_id })

    if (error) throw error
    if (!data) return { data: {} }
    return { data }
  }

  async generateQuote(template_id: string) {
    const { data, error } = await this.supabase.rpc('generate_rate_quote', { template_id })

    if (error) throw error
    if (!data) throw new Error('Failed to generate quote')
    return { data }
  }

  async calculateRate(template: RateTemplate) {
    const { data, error } = await this.supabase.rpc('calculate_rate', { template: template })

    if (error) throw error
    if (!data) throw new Error('Failed to calculate rate')
    return { data }
  }

  async validateTemplate(template: Partial<RateTemplate>) {
    const { data, error } = await this.supabase.rpc('validate_rate_template', { template })

    if (error) throw error
    if (!data) throw new Error('Failed to validate template')
    return { data }
  }

  async validateRateTemplate(template: Partial<RateTemplate>) {
    return this.validateTemplate(template)
  }

  async approveTemplate(id: string, { notes }: { notes?: string }) {
    const { data, error } = await this.supabase
      .from('rate_templates')
      .update({ status: 'approved', approval_notes: notes })
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) throw new Error('Failed to approve template')
    return { data }
  }

  async rejectTemplate(id: string, { notes }: { notes?: string }) {
    const { data, error } = await this.supabase
      .from('rate_templates')
      .update({ status: 'rejected', rejection_notes: notes })
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) throw new Error('Failed to reject template')
    return { data }
  }

  async getApprovalHistory(template_id: string) {
    const { data, error } = await this.supabase
      .from('rate_template_approvals')
      .select('*')
      .eq('template_id', template_id)
      .order('created_at', { ascending: false })

    if (error) throw error
    if (!data) return { data: [] }
    return { data }
  }

  async saveTemplate(template: Partial<RateTemplate>) {
    const { data, error } = await this.supabase
      .from('rate_templates')
      .upsert(template)
      .select()
      .single()

    if (error) throw error
    if (!data) throw new Error('Failed to save template')
    return data as RateTemplate
  }

  async deleteTemplate(id: string) {
    const { error } = await this.supabase.from('rate_templates').delete().eq('id', id)

    if (error) throw error
  }

  async getEmployees(org_id: string) {
    const { data, error } = await this.supabase.from('employees').select('*').eq('org_id', org_id)

    if (error) {
      throw new Error(`Failed to fetch employees: ${error.message}`)
    }
    if (!data) return { data: [] }
    return { data }
  }

  async getBulkCalculations(org_id: string) {
    const { data, error } = await this.supabase
      .from('bulk_rate_calculations')
      .select('*')
      .eq('org_id', org_id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch bulk calculations: ${error.message}`)
    }
    if (!data) return { data: [] }
    return { data }
  }

  async createBulkCalculation(params: {
    org_id: string
    template_id: string
    employee_ids: string[]
    metadata?: Record<string, any>
  }) {
    const { org_id, template_id, employee_ids, metadata } = params

    const { data, error } = await this.supabase
      .from('bulk_rate_calculations')
      .insert({
        org_id,
        template_id,
        employee_ids,
        status: 'pending',
        metadata,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create bulk calculation: ${error.message}`)
    }

    return { data }
  }

  async getForecastsByDateRange(params: { org_id: string; start_date: string; end_date: string }) {
    const { data, error } = await this.supabase
      .from('rate_forecasts')
      .select('*')
      .eq('org_id', params.org_id)
      .gte('forecast_date', params.start_date)
      .lte('forecast_date', params.end_date)

    if (error) throw error
    if (!data) return { data: [] }
    return { data }
  }

  async getReportsByDateRange(params: { org_id: string; start_date: string; end_date: string }) {
    const { data, error } = await this.supabase
      .from('rate_reports')
      .select('*')
      .eq('org_id', params.org_id)
      .gte('report_date', params.start_date)
      .lte('report_date', params.end_date)

    if (error) throw error
    if (!data) return { data: [] }
    return { data }
  }
}

export const ratesService = new RatesService()
