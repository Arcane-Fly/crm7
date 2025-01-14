import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { AwardRate, RateTemplate, RateCalculation, ValidationRule, CalculateRateParams, GetRateTemplatesParams } from '@/types/rates'

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

  async getTemplates(params: GetRateTemplatesParams): Promise<RateTemplate[]> {
    const { org_id, id, template_type, is_active, effective_date } = params
    let query = this.supabase
      .from('rate_templates')
      .select('*')
      .eq('org_id', org_id)

    if (id) {
      query = query.eq('id', id)
    }

    if (template_type) {
      query = query.eq('template_type', template_type)
    }

    if (typeof is_active === 'boolean') {
      query = query.eq('is_active', is_active)
    }

    if (effective_date) {
      query = query.lte('effective_from', effective_date)
        .gte('effective_to', effective_date)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
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

  async calculateRate(template: Partial<RateTemplate>, rules: ValidationRule[] | null = null): Promise<RateCalculation> {
    if (!template.base_margin || !template.super_rate) {
      throw new Error('Template must have base margin and super rate')
    }

    const baseRate = 100 // Example base rate calculation
    const calculation: RateCalculation = {
      id: crypto.randomUUID(),
      org_id: template.org_id!,
      template_id: template.id!,
      base_rate: baseRate,
      margin_amount: baseRate * (template.base_margin / 100),
      total_cost: baseRate * (1 + template.base_margin / 100),
      final_rate: baseRate * (1 + template.base_margin / 100) * (1 + template.super_rate / 100),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (rules) {
      rules.forEach(rule => {
        // Apply each rule to modify the calculation
        switch (rule.action) {
          case 'add_casual_loading':
            calculation.casual_loading = rule.parameters.rate || 0
            break
          case 'add_leave_loading':
            calculation.leave_loading_amount = rule.parameters.amount || 0
            break
          case 'add_training_cost':
            calculation.training_cost_amount = rule.parameters.amount || 0
            break
          case 'add_other_cost':
            calculation.other_costs_amount = rule.parameters.amount || 0
            break
          case 'add_funding_offset':
            calculation.funding_offset_amount = rule.parameters.amount || 0
            break
        }
      })
    }

    return calculation
  }

  async saveRateCalculation(calculation: RateCalculation): Promise<void> {
    const { error } = await this.supabase
      .from('rate_calculations')
      .insert(calculation)

    if (error) throw error
  }

  async requestTemplateApproval(templateId: string, userId: string): Promise<void> {
    const template = (await this.getTemplates({ id: templateId }))[0]
    
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
