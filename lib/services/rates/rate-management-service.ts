import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase-generated'

import {
  RateTemplate,
  RateTemplateStatus,
  BulkCalculation,
  RateTemplateHistory,
  RateCalculation,
  RateAnalytics,
} from '@/lib/types/rates'
import { logger } from '@/lib/services/logger'
import type { FairWorkService } from '../fairwork/fairwork-service'
import { BaseError } from '@/lib/types/errors'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export enum RateManagementErrorCode {
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

export class RateManagementError extends BaseError {
  constructor(
    message: string,
    code: RateManagementErrorCode,
    context: string,
    details?: Record<string, unknown>
  ) {
    super(message, code, context, details)
    this.name = 'RateManagementError'

    // Log error with context
    const errorContext: Record<string, unknown> = {
      name: this.name,
      stack: this.stack,
      errorCode: code,
      errorContext: context,
      errorDetails: details,
    }
    logger.error(this.message, errorContext)
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
      const { error } = await this.client.from('rate_templates').delete().eq('id', id)

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

  async validateRateTemplate(template: Partial<RateTemplate>): Promise<boolean> {
    if (template.templateType && !['hourly', 'daily', 'fixed'].includes(template.templateType)) {
      throw new RateManagementError(
        'Invalid template type',
        RateManagementErrorCode.VALIDATION_ERROR,
        'validateRateTemplate'
      )
    }

    if (typeof template.baseRate === 'number' && template.baseRate < 0) {
      throw new RateManagementError(
        'Base rate must be positive',
        RateManagementErrorCode.VALIDATION_ERROR,
        'validateRateTemplate'
      )
    }

    if (typeof template.baseMargin === 'number' && template.baseMargin < 0) {
      throw new RateManagementError(
        'Base margin must be positive',
        RateManagementErrorCode.VALIDATION_ERROR,
        'validateRateTemplate'
      )
    }

    // Check date validity if dates are provided
    if (template.effectiveFrom && template.effectiveTo) {
      const from = new Date(template.effectiveFrom)
      const to = new Date(template.effectiveTo)
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
    const baseAmount = template.baseRate * (1 + template.baseMargin / 100)
    const superAmount = baseAmount * (template.superRate / 100)
    const leaveAmount = baseAmount * (template.leaveLoading / 100)
    const workersCompAmount = baseAmount * (template.workersCompRate / 100)
    const payrollTaxAmount = baseAmount * (template.payrollTaxRate / 100)
    const trainingAmount = baseAmount * (template.trainingCostRate / 100)
    const otherAmount = baseAmount * (template.otherCostsRate / 100)

    const totalAmount =
      baseAmount +
      superAmount +
      leaveAmount +
      workersCompAmount +
      payrollTaxAmount +
      trainingAmount +
      otherAmount -
      template.fundingOffset

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

  async getRateTemplateHistory(id: string): Promise<RateTemplateHistory[]> {
    try {
      const { data, error } = await this.client
        .from('rate_template_history')
        .select('*')
        .eq('template_id', id)
        .order('created_at', { ascending: false })

      if (error) {
        throw new RateManagementError(
          'Failed to fetch rate template history',
          RateManagementErrorCode.DATABASE_ERROR,
          'getRateTemplateHistory',
          { error }
        )
      }

      return data as RateTemplateHistory[]
    } catch (error) {
      if (error instanceof RateManagementError) {
        throw error
      }
      throw new RateManagementError(
        'Unexpected error while fetching rate template history',
        RateManagementErrorCode.DATABASE_ERROR,
        'getRateTemplateHistory',
        { cause: error }
      )
    }
  }

  async getRateCalculations(id: string): Promise<RateCalculation[]> {
    try {
      const { data, error } = await this.client
        .from('rate_calculations')
        .select('*')
        .eq('template_id', id)
        .order('created_at', { ascending: false })

      if (error) {
        throw new RateManagementError(
          'Failed to fetch rate calculations',
          RateManagementErrorCode.DATABASE_ERROR,
          'getRateCalculations',
          { error }
        )
      }

      return data as RateCalculation[]
    } catch (error) {
      if (error instanceof RateManagementError) {
        throw error
      }
      throw new RateManagementError(
        'Unexpected error while fetching rate calculations',
        RateManagementErrorCode.DATABASE_ERROR,
        'getRateCalculations',
        { cause: error }
      )
    }
  }

  private mapToRateTemplate(data: any): RateTemplate {
    return {
      id: data.id,
      orgId: data.orgId,
      name: data.name,
      templateType: data.templateType,
      description: data.description,
      baseRate: data.baseRate,
      baseMargin: data.baseMargin,
      superRate: data.superRate,
      leaveLoading: data.leaveLoading,
      workersCompRate: data.workersCompRate,
      payrollTaxRate: data.payrollTaxRate,
      trainingCostRate: data.trainingCostRate,
      otherCostsRate: data.otherCostsRate,
      fundingOffset: data.fundingOffset,
      casualLoading: data.casualLoading,
      effectiveFrom: data.effectiveFrom,
      effectiveTo: data.effectiveTo,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
      version: data.version,
    }
  }

  async getAnalytics(orgId: string): Promise<RateAnalytics> {
    try {
      const [templates, activeTemplates] = await Promise.all([
        this.getRateTemplates(orgId),
        this.getRateTemplates(orgId).then((templates) =>
          templates.filter((t) => t.status === 'active')
        ),
      ])

      const averageRate =
        activeTemplates.length > 0
          ? activeTemplates.reduce((sum, t) => sum + t.baseRate, 0) / activeTemplates.length
          : 0

      // Get recent changes from history
      const { data: history, error } = await this.client
        .from('rate_template_history')
        .select('*')
        .eq('orgId', orgId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        throw new RateManagementError(
          'Failed to fetch template history',
          RateManagementErrorCode.DATABASE_ERROR,
          'getAnalytics',
          { error }
        )
      }

      return {
        totalTemplates: templates.length,
        activeTemplates: activeTemplates.length,
        averageRate,
        recentChanges: history.map((h) => ({
          templateId: h.templateId,
          action: h.changes.type as 'created' | 'updated' | 'deleted',
          timestamp: h.createdAt,
        })),
      }
    } catch (error) {
      if (error instanceof RateManagementError) {
        throw error
      }
      throw new RateManagementError(
        'Unexpected error while fetching analytics',
        RateManagementErrorCode.DATABASE_ERROR,
        'getAnalytics',
        { cause: error }
      )
    }
  }

  private mapFromRateTemplate(template: Partial<RateTemplate>): Record<string, any> {
    return {
      orgId: template.orgId,
      name: template.name,
      templateType: template.templateType,
      description: template.description,
      baseRate: template.baseRate,
      baseMargin: template.baseMargin,
      superRate: template.superRate,
      leaveLoading: template.leaveLoading,
      workersCompRate: template.workersCompRate,
      payrollTaxRate: template.payrollTaxRate,
      trainingCostRate: template.trainingCostRate,
      otherCostsRate: template.otherCostsRate,
      fundingOffset: template.fundingOffset,
      casualLoading: template.casualLoading,
      effectiveFrom: template.effectiveFrom,
      effectiveTo: template.effectiveTo,
      status: template.status,
      updatedBy: template.updatedBy,
    }
  }
}
