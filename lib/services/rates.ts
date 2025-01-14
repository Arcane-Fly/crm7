import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

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

export class RatesService {
  private supabase = createClient<Database>()

  async getTemplates(params: GetRateTemplatesParams) {
    const { org_id, is_active, status } = params
    const query = this.supabase
      .from('rate_templates')
      .select('*')
      .eq('org_id', org_id)

    if (is_active !== undefined) {
      query.eq('is_active', is_active)
    }

    if (status) {
      query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data as RateTemplate[]
  }

  async calculateRate(template: RateTemplate): Promise<RateCalculation> {
    if (!template.base_margin) {
      throw new Error('Base margin is required')
    }

    if (!template.super_rate) {
      throw new Error('Super rate is required')
    }

    const baseRate = template.base_rate
    const baseMargin = template.base_margin
    const superRate = template.super_rate

    // Calculate components
    const superAmount = baseRate * (superRate / 100)
    const marginAmount = baseRate * (baseMargin / 100)

    // Calculate final rate
    const finalRate = baseRate + superAmount + marginAmount

    return {
      template_id: template.id,
      base_rate: baseRate,
      super_amount: superAmount,
      margin_amount: marginAmount,
      total_cost: finalRate,
      final_rate: finalRate,
    }
  }

  async validateTemplate(template: Partial<RateTemplate>, rules: ValidationRule[]) {
    if (!rules?.length) {
      return true
    }

    for (const rule of rules) {
      const value = template[rule.field]
      if (value === undefined) {
        return false
      }

      switch (rule.type) {
        case 'required':
          if (!value) {
            return false
          }
          break
        case 'min':
          if (typeof value === 'number' && value < (rule.value || 0)) {
            return false
          }
          break
        case 'max':
          if (typeof value === 'number' && value > (rule.value || 0)) {
            return false
          }
          break
      }
    }

    return true
  }

  async saveTemplate(template: Partial<RateTemplate>) {
    const { data, error } = await this.supabase
      .from('rate_templates')
      .upsert(template)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as RateTemplate
  }

  async deleteTemplate(id: string) {
    const { error } = await this.supabase
      .from('rate_templates')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  }
}

export const ratesService = new RatesService()
