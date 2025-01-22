import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient, Database } from '@supabase/supabase-js'
import { RateTemplate, RateTemplateStatus, BulkCalculation } from '@/lib/types/rates'
import { logger } from '@/lib/services/logger'
import type { FairWorkService } from '../fairwork/fairwork-service'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export enum RateManagementErrorCode {
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

export class RateManagementError extends Error {
  constructor(message: string, public readonly code: RateManagementErrorCode, public readonly context: string, public readonly details?: Record<string, unknown>) {
    super(message)
    this.name = 'RateManagementError'
    
    // Log error with context
    logger.error('Rate management error:', {
      code: this.code,
      context: this.context,
      details: this.details,
      message: this.message
    })
  }
}

export class RateManagementService {
  private client: SupabaseClient<Database>
  private fairWorkService: FairWorkService

  constructor(fairWorkService: FairWorkService, client?: SupabaseClient<Database>) {
    this.client = client || supabase
    this.fairWorkService = fairWorkService
  }

  async getRateTemplates(orgId: string): Promise<RateTemplate[]> {
    try {
      const { data, error } = await this.client
        .from('rate_templates')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new RateManagementError(
          'Failed to fetch rate templates',
          RateManagementErrorCode.DATABASE_ERROR,
          'getRateTemplates',
          { error }
        )
      }

      return data as RateTemplate[]
    } catch (error) {
      if (error instanceof RateManagementError) {
        throw error
      }
      throw new RateManagementError(
        'Unexpected error while fetching rate templates',
        RateManagementErrorCode.DATABASE_ERROR,
        'getRateTemplates',
        { cause: error }
      )
    }
  }

  async getRateTemplateById(id: string): Promise<RateTemplate | null> {
    try {
      const { data, error } = await this.client
        .from('rate_templates')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        throw new RateManagementError(
          'Failed to fetch rate template',
          RateManagementErrorCode.DATABASE_ERROR,
          'getRateTemplateById',
          { error }
        )
      }

      if (!data) {
        throw new RateManagementError(
          'Template not found',
          RateManagementErrorCode.TEMPLATE_NOT_FOUND,
          'getRateTemplateById',
          { templateId: id }
        )
      }

      return data as RateTemplate
    } catch (error) {
      if (error instanceof RateManagementError) {
        throw error
      }
      throw new RateManagementError(
        'Unexpected error while fetching rate template',
        RateManagementErrorCode.DATABASE_ERROR,
        'getRateTemplateById',
        { cause: error }
      )
    }
  }

  async createRateTemplate(template: Omit<RateTemplate, 'id'>): Promise<RateTemplate> {
    try {
      // Validate template data
      this.validateRateTemplate(template)

      const { data, error } = await this.client
        .from('rate_templates')
        .insert([template])
        .select()
        .single()

      if (error) {
        throw new RateManagementError(
          'Failed to create rate template',
          RateManagementErrorCode.DATABASE_ERROR,
          'createRateTemplate',
          { error }
        )
      }

      return data as RateTemplate
    } catch (error) {
      if (error instanceof RateManagementError) {
        throw error
      }
      throw new RateManagementError(
        'Unexpected error while creating rate template',
        RateManagementErrorCode.DATABASE_ERROR,
        'createRateTemplate',
        { cause: error }
      )
    }
  }

  async updateRateTemplate(id: string, template: Partial<RateTemplate>): Promise<RateTemplate> {
    try {
      // Validate template data
      this.validateRateTemplate(template)

      const { data, error } = await this.client
        .from('rate_templates')
        .update(template)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new RateManagementError(
          'Failed to update rate template',
          RateManagementErrorCode.DATABASE_ERROR,
          'updateRateTemplate',
          { error }
        )
      }

      if (!data) {
        throw new RateManagementError(
          'Template not found',
          RateManagementErrorCode.TEMPLATE_NOT_FOUND,
          'updateRateTemplate',
          { templateId: id }
        )
      }

      return data as RateTemplate
    } catch (error) {
      if (error instanceof RateManagementError) {
        throw error
      }
      throw new RateManagementError(
        'Unexpected error while updating rate template',
        RateManagementErrorCode.DATABASE_ERROR,
        'updateRateTemplate',
        { cause: error }
      )
    }
  }

  async updateRateTemplateStatus(
    id: string,
    status: RateTemplateStatus,
    updated_by: string
  ): Promise<RateTemplate> {
    try {
      const { data, error } = await this.client
        .from('rate_templates')
        .update({ status, updated_by })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new RateManagementError(
          'Failed to update rate template status',
          RateManagementErrorCode.DATABASE_ERROR,
          'updateRateTemplateStatus',
          { error }
        )
      }

      if (!data) {
        throw new RateManagementError(
          'Template not found',
          RateManagementErrorCode.TEMPLATE_NOT_FOUND,
          'updateRateTemplateStatus',
          { templateId: id }
        )
      }

      return data as RateTemplate
    } catch (error) {
      if (error instanceof RateManagementError) {
        throw error
      }
      throw new RateManagementError(
        'Unexpected error while updating rate template status',
        RateManagementErrorCode.DATABASE_ERROR,
        'updateRateTemplateStatus',
        { cause: error }
      )
    }
  }

  async deleteRateTemplate(id: string): Promise<void> {
    try {
      const { error } = await this.client
        .from('rate_templates')
        .delete()
        .eq('id', id)

      if (error) {
        throw new RateManagementError(
          'Failed to delete rate template',
          RateManagementErrorCode.DATABASE_ERROR,
          'deleteRateTemplate',
          { error }
        )
      }
    } catch (error) {
      if (error instanceof RateManagementError) {
        throw error
      }
      throw new RateManagementError(
        'Unexpected error while deleting rate template',
        RateManagementErrorCode.DATABASE_ERROR,
        'deleteRateTemplate',
        { cause: error }
      )
    }
  }

  async validateRateTemplate(template: RateTemplate): Promise<boolean> {
    if (!template.template_type || !['hourly', 'daily', 'fixed'].includes(template.template_type)) {
      throw new RateManagementError(
        'Invalid template type',
        RateManagementErrorCode.VALIDATION_ERROR,
        'validateRateTemplate'
      )
    }

    if (template.base_rate < 0) {
      throw new RateManagementError(
        'Base rate must be positive',
        RateManagementErrorCode.VALIDATION_ERROR,
        'validateRateTemplate'
      )
    }

    if (template.base_margin < 0) {
      throw new RateManagementError(
        'Base margin must be positive',
        RateManagementErrorCode.VALIDATION_ERROR,
        'validateRateTemplate'
      )
    }

    // Check date validity if dates are provided
    if (template.effective_from && template.effective_to) {
      const from = new Date(template.effective_from)
      const to = new Date(template.effective_to)
      if (from > to) {
        throw new RateManagementError(
          'Effective from date must be before effective to date',
          RateManagementErrorCode.VALIDATION_ERROR,
          'validateRateTemplate'
        )
      }
    }

    return true
  }

  async calculateRate(template: RateTemplate): Promise<number> {
    const baseAmount = template.base_rate * (1 + template.base_margin / 100)
    const superAmount = baseAmount * (template.super_rate / 100)
    const leaveAmount = baseAmount * (template.leave_loading / 100)
    const workersCompAmount = baseAmount * (template.workers_comp_rate / 100)
    const payrollTaxAmount = baseAmount * (template.payroll_tax_rate / 100)
    const trainingAmount = baseAmount * (template.training_cost_rate / 100)
    const otherAmount = baseAmount * (template.other_costs_rate / 100)

    const totalAmount = baseAmount + 
      superAmount + 
      leaveAmount + 
      workersCompAmount + 
      payrollTaxAmount + 
      trainingAmount + 
      otherAmount - 
      template.funding_offset

    return Number(totalAmount.toFixed(2))
  }

  async getBulkCalculations(org_id: string): Promise<BulkCalculation[]> {
    try {
      const { data, error } = await this.client
        .from('bulk_calculations')
        .select('*')
        .eq('org_id', org_id)
        .order('created_at', { ascending: false })

      if (error) {
        throw new RateManagementError(
          'Failed to fetch bulk calculations',
          RateManagementErrorCode.DATABASE_ERROR,
          'getBulkCalculations',
          { error }
        )
      }

      return data as BulkCalculation[]
    } catch (error) {
      if (error instanceof RateManagementError) {
        throw error
      }
      throw new RateManagementError(
        'Unexpected error while fetching bulk calculations',
        RateManagementErrorCode.DATABASE_ERROR,
        'getBulkCalculations',
        { cause: error }
      )
    }
  }

  async createBulkCalculation(calculation: Omit<BulkCalculation, 'id'>): Promise<BulkCalculation> {
    try {
      const { data, error } = await this.client
        .from('bulk_calculations')
        .insert([calculation])
        .select()
        .single()

      if (error) {
        throw new RateManagementError(
          'Failed to create bulk calculation',
          RateManagementErrorCode.DATABASE_ERROR,
          'createBulkCalculation',
          { error }
        )
      }

      return data as BulkCalculation
    } catch (error) {
      if (error instanceof RateManagementError) {
        throw error
      }
      throw new RateManagementError(
        'Unexpected error while creating bulk calculation',
        RateManagementErrorCode.DATABASE_ERROR,
        'createBulkCalculation',
        { cause: error }
      )
    }
  }

  private mapToRateTemplate(data: any): RateTemplate {
    return {
      id: data.id,
      org_id: data.org_id,
      name: data.name,
      template_type: data.template_type,
      description: data.description,
      base_rate: data.base_rate,
      base_margin: data.base_margin,
      super_rate: data.super_rate,
      leave_loading: data.leave_loading,
      workers_comp_rate: data.workers_comp_rate,
      payroll_tax_rate: data.payroll_tax_rate,
      training_cost_rate: data.training_cost_rate,
      other_costs_rate: data.other_costs_rate,
      funding_offset: data.funding_offset,
      effective_from: data.effective_from,
      effective_to: data.effective_to,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
      updated_by: data.updated_by,
    }
  }

  private mapFromRateTemplate(template: Partial<RateTemplate>): Record<string, any> {
    return {
      org_id: template.org_id,
      name: template.name,
      template_type: template.template_type,
      description: template.description,
      base_rate: template.base_rate,
      base_margin: template.base_margin,
      super_rate: template.super_rate,
      leave_loading: template.leave_loading,
      workers_comp_rate: template.workers_comp_rate,
      payroll_tax_rate: template.payroll_tax_rate,
      training_cost_rate: template.training_cost_rate,
      other_costs_rate: template.other_costs_rate,
      funding_offset: template.funding_offset,
      effective_from: template.effective_from,
      effective_to: template.effective_to,
      status: template.status,
      updated_by: template.updated_by,
    }
  }
}
