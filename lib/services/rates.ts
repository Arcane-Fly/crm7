import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export interface AwardRate {
  id: string
  award_code: string
  award_name: string
  classification_code: string
  classification_name: string
  level: string
  year_of_apprenticeship: number
  base_rate: number
  casual_loading: number
  super_rate: number
  leave_loading: number
  effective_from: Date
  effective_to: Date | null
  published_year: number
  version_number: number
  metadata: Record<string, any>
}

export interface RateTemplate {
  id: string
  org_id: string
  template_name: string
  template_type: 'apprentice' | 'trainee' | 'casual' | 'permanent' | 'contractor'
  base_margin: number
  super_rate: number
  leave_loading?: number
  workers_comp_rate: number
  payroll_tax_rate: number
  training_cost_rate?: number
  other_costs_rate?: number
  funding_offset?: number
  effective_from: Date
  effective_to?: Date
  is_active: boolean
  is_approved: boolean
  version_number: number
  rules: Record<string, any>
  metadata?: Record<string, any>
}

export interface RateCalculation {
  id: string
  template_id: string
  employee_id: string
  base_rate: number
  casual_loading?: number
  allowances: any[]
  penalties: any[]
  super_amount: number
  leave_loading_amount?: number
  workers_comp_amount: number
  payroll_tax_amount: number
  training_cost_amount?: number
  other_costs_amount?: number
  funding_offset_amount?: number
  margin_amount: number
  total_cost: number
  final_rate: number
  calculation_date: Date
  metadata?: Record<string, any>
}

export interface ValidationRule {
  id: string
  org_id: string
  rule_name: string
  rule_type: 'range' | 'required' | 'comparison' | 'custom'
  field_name: string
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'between'
  value: any
  error_message: string
  is_active: boolean
  priority: number
  metadata?: Record<string, any>
}

export interface CalculateRateParams {
  template_id: string
  employee_id: string
  base_rate: number
  casual_loading?: number
  allowances?: any[]
  penalties?: any[]
}

export interface GetRateTemplatesParams {
  org_id: string
  id?: string
  template_type?: RateTemplate['template_type']
  is_active?: boolean
  effective_date?: Date
}

export class RatesService {
  private supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  constructor() {
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  async getAwardRates(params: {
    award_code?: string
    classification_code?: string
    effective_date?: Date
    published_year?: number
  }): Promise<AwardRate[]> {
    let query = this.supabase
      .from('award_rates')
      .select('*')
      
    if (params.award_code) {
      query = query.eq('award_code', params.award_code)
    }
    
    if (params.classification_code) {
      query = query.eq('classification_code', params.classification_code)
    }
    
    if (params.effective_date) {
      query = query
        .lte('effective_from', params.effective_date)
        .or(`effective_to.is.null,effective_to.gt.${params.effective_date}`)
    }
    
    if (params.published_year) {
      query = query.eq('published_year', params.published_year)
    }

    const { data, error } = await query.order('effective_from', { ascending: false })
    
    if (error) throw error
    return data
  }

  async getRateTemplates(params: GetRateTemplatesParams): Promise<RateTemplate[]> {
    let query = this.supabase
      .from('rate_templates')
      .select('*')
      .eq('org_id', params.org_id)

    if (params.id) {
      query = query.eq('id', params.id)
    }

    if (params.template_type) {
      query = query.eq('template_type', params.template_type)
    }

    if (params.is_active !== undefined) {
      query = query.eq('is_active', params.is_active)
    }

    if (params.effective_date) {
      query = query
        .lte('effective_from', params.effective_date)
        .or(`effective_to.gt.${params.effective_date},effective_to.is.null`)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  }

  async validateRateTemplate(template: Partial<RateTemplate>): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = []

    // Load validation rules
    const { data: rules } = await this.supabase
      .from('rate_validation_rules')
      .select('*')
      .eq('org_id', template.org_id)
      .eq('is_active', true)
      .order('priority', { ascending: false })

    for (const rule of rules) {
      const value = template[rule.field_name]

      switch (rule.rule_type) {
        case 'required':
          if (value === undefined || value === null || value === '') {
            errors.push(rule.error_message)
          }
          break

        case 'range':
          if (rule.operator === 'between') {
            const [min, max] = rule.value
            if (value < min || value > max) {
              errors.push(rule.error_message)
            }
          }
          break

        case 'comparison':
          switch (rule.operator) {
            case 'eq':
              if (value !== rule.value) errors.push(rule.error_message)
              break
            case 'neq':
              if (value === rule.value) errors.push(rule.error_message)
              break
            case 'gt':
              if (value <= rule.value) errors.push(rule.error_message)
              break
            case 'gte':
              if (value < rule.value) errors.push(rule.error_message)
              break
            case 'lt':
              if (value >= rule.value) errors.push(rule.error_message)
              break
            case 'lte':
              if (value > rule.value) errors.push(rule.error_message)
              break
            case 'in':
              if (!rule.value.includes(value)) errors.push(rule.error_message)
              break
            case 'nin':
              if (rule.value.includes(value)) errors.push(rule.error_message)
              break
          }
          break

        case 'custom':
          try {
            const fn = new Function('value', 'template', rule.value)
            if (!fn(value, template)) {
              errors.push(rule.error_message)
            }
          } catch (error) {
            console.error('Custom validation error:', error)
            errors.push('Invalid custom validation rule')
          }
          break
      }
    }

    // Business logic validations
    if (template.effective_from && template.effective_to) {
      if (new Date(template.effective_from) >= new Date(template.effective_to)) {
        errors.push('Effective from date must be before effective to date')
      }
    }

    if (template.base_margin < 0) {
      errors.push('Base margin cannot be negative')
    }

    if (template.super_rate < 0) {
      errors.push('Super rate cannot be negative')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  async calculateRate(params: CalculateRateParams): Promise<RateCalculation> {
    const { data, error } = await this.supabase.rpc('calculate_rate', params)
    if (error) throw error
    return data[0]
  }

  async saveRateCalculation(calculation: RateCalculation): Promise<void> {
    const { error } = await this.supabase
      .from('rate_calculations')
      .insert(calculation)

    if (error) throw error
  }

  async requestTemplateApproval(templateId: string, userId: string): Promise<void> {
    const template = (await this.getRateTemplates({ id: templateId }))[0]
    
    const { error } = await this.supabase
      .from('rate_template_approvals')
      .insert({
        template_id: templateId,
        org_id: template.org_id,
        requested_by: userId,
        status: 'pending',
        changes: template
      })

    if (error) throw error
  }

  async getRateHistory(params: {
    org_id: string
    employee_id?: string
    template_id?: string
    from_date?: Date
    to_date?: Date
  }): Promise<any[]> {
    let query = this.supabase
      .from('rate_calculation_history')
      .select(`
        *,
        template:rate_templates(
          template_name,
          template_type
        ),
        employee:employees(
          first_name,
          last_name
        )
      `)
      .eq('org_id', params.org_id)

    if (params.employee_id) {
      query = query.eq('employee_id', params.employee_id)
    }

    if (params.template_id) {
      query = query.eq('template_id', params.template_id)
    }

    if (params.from_date) {
      query = query.gte('calculation_date', params.from_date)
    }

    if (params.to_date) {
      query = query.lte('calculation_date', params.to_date)
    }

    const { data, error } = await query.order('calculation_date', { ascending: false })

    if (error) throw error
    return data
  }
}

export const ratesService = new RatesService()
