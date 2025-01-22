import axios from 'axios'
import type {
  RateForecast,
  RateReport,
  GetForecastsParams,
  GetReportsParams,
  ApiResponse,
} from '@/types/rates'
import type {
  RateTemplate,
  RateCalculation,
  ValidationResult,
  RateTemplateHistory,
} from '../types/rates'
import { logger } from './logger'
import { supabase } from '@/lib/supabase'

class RatesService {
  private baseUrl = '/api/rates'
  private supabase = supabase

  /**
   * Get rate forecasts for a date range
   */
  async getForecastsByDateRange(params: GetForecastsParams): Promise<ApiResponse<RateForecast[]>> {
    try {
      const response = await axios.get<ApiResponse<RateForecast[]>>(`${this.baseUrl}/forecasts`, {
        params: {
          org_id: params.org_id,
          start_date: params.start_date,
          end_date: params.end_date,
          ...params.filters,
        },
      })
      return response.data
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      logger.error('Failed to fetch rate forecasts', err, { params })
      throw err
    }
  }

  /**
   * Get rate reports for a date range
   */
  async getReportsByDateRange(params: GetReportsParams): Promise<ApiResponse<RateReport[]>> {
    try {
      const response = await axios.get<ApiResponse<RateReport[]>>(`${this.baseUrl}/reports`, {
        params: {
          org_id: params.org_id,
          start_date: params.start_date,
          end_date: params.end_date,
          ...params.filters,
        },
      })
      return response.data
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      logger.error('Failed to fetch rate reports', err, { params })
      throw err
    }
  }

  /**
   * Get a single rate forecast by ID
   */
  async getForecastById(id: string): Promise<RateForecast> {
    try {
      const response = await axios.get<RateForecast>(`${this.baseUrl}/forecasts/${id}`)
      return response.data
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      logger.error('Failed to fetch rate forecast', err, { id })
      throw err
    }
  }

  /**
   * Get a single rate report by ID
   */
  async getReportById(id: string): Promise<RateReport> {
    try {
      const response = await axios.get<RateReport>(`${this.baseUrl}/reports/${id}`)
      return response.data
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      logger.error('Failed to fetch rate report', err, { id })
      throw err
    }
  }

  async getTemplate(id: string): Promise<RateTemplate | null> {
    const { data, error } = await this.supabase
      .from('rate_templates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async getTemplates(params: { org_id: string }): Promise<{ data: RateTemplate[] }> {
    const { data, error } = await this.supabase
      .from('rate_templates')
      .select('*')
      .eq('org_id', params.org_id)

    if (error) throw error
    return { data }
  }

  async validateRateTemplate(template: RateTemplate): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Required fields
    if (!template.template_name) {
      errors.push('Template name is required')
    }

    if (!template.template_type) {
      errors.push('Template type is required')
    }

    if (!template.effective_from) {
      errors.push('Effective from date is required')
    }

    if (!template.effective_to) {
      errors.push('Effective to date is required')
    }

    // Numeric validations
    if (template.base_rate < 0) {
      errors.push('Base rate cannot be negative')
    }

    if (template.base_margin < 0) {
      errors.push('Base margin cannot be negative')
    }

    if (template.super_rate < 0) {
      errors.push('Superannuation rate cannot be negative')
    }

    if (template.leave_loading < 0) {
      errors.push('Leave loading cannot be negative')
    }

    if (template.workers_comp_rate < 0) {
      errors.push('Workers compensation rate cannot be negative')
    }

    if (template.payroll_tax_rate < 0) {
      errors.push('Payroll tax rate cannot be negative')
    }

    if (template.training_cost_rate < 0) {
      errors.push('Training cost rate cannot be negative')
    }

    if (template.other_costs_rate < 0) {
      errors.push('Other costs rate cannot be negative')
    }

    // Date validations
    const effectiveFrom = new Date(template.effective_from)
    const effectiveTo = new Date(template.effective_to)

    if (effectiveTo < effectiveFrom) {
      errors.push('Effective to date must be after effective from date')
    }

    // Business rule warnings
    if (template.base_margin > 50) {
      warnings.push('Base margin is unusually high (>50%)')
    }

    if (template.super_rate < 10.5) {
      warnings.push('Superannuation rate is below the statutory minimum (10.5%)')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  async saveTemplate(template: RateTemplate, approverNotes?: string): Promise<RateTemplate> {
    const { data, error } = await this.supabase
      .from('rate_templates')
      .upsert(template)
      .select()
      .single()

    if (error) throw error

    // If template status changed to approved/rejected, add history entry
    if (approverNotes && (template.status === 'approved' || template.status === 'rejected')) {
      await this.addTemplateHistory({
        template_id: template.id,
        action: template.status === 'approved' ? 'approve' : 'reject',
        notes: approverNotes,
        approver_id: 'current-user-id', // TODO: Get from auth context
      });
    }

    return data
  }

  async getTemplateHistory(templateId: string): Promise<RateTemplateHistory[]> {
    const { data, error } = await this.supabase
      .from('rate_template_history')
      .select('*')
      .eq('template_id', templateId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  private async addTemplateHistory(history: Omit<RateTemplateHistory, 'id' | 'created_at'>): Promise<RateTemplateHistory> {
    const { data, error } = await this.supabase
      .from('rate_template_history')
      .insert(history)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async calculateRate(params: { template_id: string; org_id: string }): Promise<{ data: RateCalculation }> {
    const template = await this.getTemplate(params.template_id)
    if (!template) {
      throw new Error('Template not found')
    }

    // Calculate the rate based on the template
    const calculation: RateCalculation = {
      id: crypto.randomUUID(),
      org_id: params.org_id,
      template_id: params.template_id,
      employee_id: '', // This would be set when calculating for a specific employee
      date: new Date().toISOString(),
      hours: 0, // This would be set based on actual hours
      base_rate: template.base_rate,
      multipliers: {
        super_rate: template.super_rate,
        leave_loading: template.leave_loading,
        workers_comp_rate: template.workers_comp_rate,
        payroll_tax_rate: template.payroll_tax_rate,
        training_cost_rate: template.training_cost_rate,
        other_costs_rate: template.other_costs_rate,
      },
      total_amount: template.base_rate * (1 + template.base_margin / 100),
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Save the calculation
    const { data, error } = await this.supabase
      .from('rate_calculations')
      .insert(calculation)
      .select()
      .single()

    if (error) throw error
    return { data }
  }
}

export const ratesService = new RatesService()
