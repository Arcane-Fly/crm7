import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { AwardRate, RateTemplate, RateCalculation, ValidationRule, CalculateRateParams, GetRateTemplatesParams } from '@/types/rates'

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
  private supabase: SupabaseClient<Database>

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey)
  }

  protected getSupabase() {
    return this.supabase
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
    // Get the template first to validate
    const templates = await this.getRateTemplates({ id: params.template_id })
    if (!templates.length) {
      throw new Error('Rate template not found')
    }
    
    const template = templates[0]
    
    // Validate the template is active and approved
    if (!template.is_active) {
      throw new Error('Rate template is not active')
    }
    if (!template.is_approved) {
      throw new Error('Rate template is not approved')
    }

    // Calculate the rate using the database function
    const { data, error } = await this.supabase.rpc('calculate_rate', {
      p_template_id: params.template_id,
      p_employee_id: params.employee_id,
      p_base_rate: params.base_rate,
      p_casual_loading: params.casual_loading,
      p_allowances: params.allowances || [],
      p_penalties: params.penalties || []
    })

    if (error) throw error
    
    // Add additional validation and business logic
    const calculation = data[0]
    
    // Ensure the final rate meets minimum requirements
    if (calculation.final_rate < params.base_rate) {
      throw new Error('Final rate cannot be less than base rate')
    }

    // Validate against template rules if they exist
    if (template.rules) {
      const validationResult = await this.validateCalculation(calculation, template.rules)
      if (!validationResult.isValid) {
        throw new Error(`Rate calculation failed validation: ${validationResult.errors.join(', ')}`)
      }
    }

    return calculation
  }

  private async validateCalculation(
    calculation: RateCalculation,
    rules: Record<string, any>
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = []

    // Example rule validations
    if (rules.minimum_margin) {
      const marginPercentage = calculation.margin_amount / calculation.total_cost
      if (marginPercentage < rules.minimum_margin) {
        errors.push(`Margin percentage (${(marginPercentage * 100).toFixed(2)}%) is below minimum required (${(rules.minimum_margin * 100).toFixed(2)}%)`)
      }
    }

    if (rules.maximum_margin) {
      const marginPercentage = calculation.margin_amount / calculation.total_cost
      if (marginPercentage > rules.maximum_margin) {
        errors.push(`Margin percentage (${(marginPercentage * 100).toFixed(2)}%) is above maximum allowed (${(rules.maximum_margin * 100).toFixed(2)}%)`)
      }
    }

    if (rules.minimum_total_rate && calculation.final_rate < rules.minimum_total_rate) {
      errors.push(`Final rate (${calculation.final_rate}) is below minimum required rate (${rules.minimum_total_rate})`)
    }

    if (rules.maximum_total_rate && calculation.final_rate > rules.maximum_total_rate) {
      errors.push(`Final rate (${calculation.final_rate}) is above maximum allowed rate (${rules.maximum_total_rate})`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
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

export const ratesService = new RatesService(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
