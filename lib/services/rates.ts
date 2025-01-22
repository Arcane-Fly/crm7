import axios from 'axios'
import type {
  RateForecast,
  RateReport,
  GetForecastsParams,
  GetReportsParams,
  ApiResponse,
} from '@/types/rates'
import type { RateTemplate, RateCalculation, RateTemplateHistory } from '../types/rates'
import type { ValidationResult } from '../types/validation'
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

  async getTemplate(id: string): Promise<RateTemplate> {
    const { data, error } = await this.supabase
      .from('rate_templates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Failed to get template: ${error.message}`)
    }

    if (!data) {
      throw new Error('Template not found')
    }

    return this.mapToRateTemplate(data)
  }

  async getTemplates(params: { org_id: string }): Promise<{ data: RateTemplate[] }> {
    const { data, error } = await this.supabase
      .from('rate_templates')
      .select('*')
      .eq('org_id', params.org_id)

    if (error) throw error
    return { data: data.map(this.mapToRateTemplate) }
  }

  async validateRateTemplate(template: RateTemplate): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Required fields
    if (!template.name) {
      errors.push('Template name is required')
    }

    if (!template.templateType) {
      errors.push('Template type is required')
    }

    if (!template.effectiveFrom) {
      errors.push('Effective from date is required')
    }

    if (!template.effectiveTo) {
      errors.push('Effective to date is required')
    }

    // Numeric validations
    if (template.baseRate < 0) {
      errors.push('Base rate cannot be negative')
    }

    if (template.baseMargin < 0) {
      errors.push('Base margin cannot be negative')
    }

    if (template.superRate < 0) {
      errors.push('Superannuation rate cannot be negative')
    }

    if (template.leaveLoading < 0) {
      errors.push('Leave loading cannot be negative')
    }

    if (template.workersCompRate < 0) {
      errors.push('Workers compensation rate cannot be negative')
    }

    if (template.payrollTaxRate < 0) {
      errors.push('Payroll tax rate cannot be negative')
    }

    if (template.trainingCostRate < 0) {
      errors.push('Training cost rate cannot be negative')
    }

    if (template.otherCostsRate < 0) {
      errors.push('Other costs rate cannot be negative')
    }

    // Date validations
    if (template.effectiveFrom && template.effectiveTo) {
      const from = new Date(template.effectiveFrom)
      const to = new Date(template.effectiveTo)
      if (from > to) {
        errors.push('Effective from date must be before effective to date')
      }
    }

    // Business rule warnings
    if (template.baseMargin > 50) {
      warnings.push('Base margin is unusually high (>50%)')
    }

    if (template.superRate < 10.5) {
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
      .upsert(this.mapFromRateTemplate(template))
      .select()
      .single()

    if (error) throw error

    // If template status changed to approved/rejected, add history entry
    if (approverNotes && (template.status === 'approved' || template.status === 'rejected')) {
      await this.addTemplateHistory({
        template_id: template.id,
        action: template.status === 'approved' ? 'approve' : 'reject',
        notes: approverNotes,
        approver_id: template.updatedBy || 'system',
        created_by: template.updatedBy || 'system',
        changes: {},
      })
    }

    return this.mapToRateTemplate(data)
  }

  async updateTemplate(template: RateTemplate): Promise<RateTemplate> {
    const { data, error } = await this.supabase
      .from('rate_templates')
      .update(template)
      .eq('id', template.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update template: ${error.message}`)
    }

    return data
  }

  async getTemplateHistory(templateId: string): Promise<RateTemplateHistory[]> {
    const { data, error } = await this.supabase
      .from('rate_template_history')
      .select('*')
      .eq('template_id', templateId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get template history: ${error.message}`)
    }

    return data || []
  }

  private async addTemplateHistory(
    history: Omit<RateTemplateHistory, 'id' | 'created_at'>
  ): Promise<RateTemplateHistory> {
    const { data, error } = await this.supabase
      .from('rate_template_history')
      .insert(history)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async calculateRate(template: RateTemplate): Promise<RateCalculation> {
    const baseAmount = template.baseRate * (1 + template.baseMargin / 100)
    const superAmount = baseAmount * (template.superRate / 100)
    const leaveAmount = baseAmount * (template.leaveLoading / 100)
    const workersCompAmount = baseAmount * (template.workersCompRate / 100)
    const payrollTaxAmount = baseAmount * (template.payrollTaxRate / 100)
    const trainingAmount = baseAmount * (template.trainingCostRate / 100)
    const otherAmount = baseAmount * (template.otherCostsRate / 100)
    const fundingAmount = template.fundingOffset || 0

    return {
      baseRate: template.baseRate,
      components: {
        superannuation: superAmount,
        leaveLoading: leaveAmount,
        workersComp: workersCompAmount,
        payrollTax: payrollTaxAmount,
        trainingCosts: trainingAmount,
        otherCosts: otherAmount,
        fundingOffset: fundingAmount,
      },
      totalAmount:
        baseAmount +
        superAmount +
        leaveAmount +
        workersCompAmount +
        payrollTaxAmount +
        trainingAmount +
        otherAmount -
        fundingAmount,
    }
  }

  private mapToRateTemplate(data: any): RateTemplate {
    if (!data) throw new Error('No data to map to RateTemplate')

    return {
      id: data.id,
      orgId: data.org_id,
      name: data.name,
      templateType: data.template_type,
      description: data.description,
      baseRate: data.base_rate,
      baseMargin: data.base_margin,
      superRate: data.super_rate,
      leaveLoading: data.leave_loading,
      workersCompRate: data.workers_comp_rate,
      payrollTaxRate: data.payroll_tax_rate,
      trainingCostRate: data.training_cost_rate,
      otherCostsRate: data.other_costs_rate,
      fundingOffset: data.funding_offset,
      effectiveFrom: data.effective_from,
      effectiveTo: data.effective_to,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      updatedBy: data.updated_by,
    }
  }

  private mapFromRateTemplate(template: Partial<RateTemplate>): Record<string, any> {
    return {
      org_id: template.orgId,
      name: template.name,
      template_type: template.templateType,
      description: template.description,
      base_rate: template.baseRate,
      base_margin: template.baseMargin,
      super_rate: template.superRate,
      leave_loading: template.leaveLoading,
      workers_comp_rate: template.workersCompRate,
      payroll_tax_rate: template.payrollTaxRate,
      training_cost_rate: template.trainingCostRate,
      other_costs_rate: template.otherCostsRate,
      funding_offset: template.fundingOffset,
      effective_from: template.effectiveFrom,
      effective_to: template.effectiveTo,
      status: template.status,
      updated_by: template.updatedBy,
    }
  }
}

export const ratesService = new RatesService()

export type { RateTemplate, RateCalculation }
