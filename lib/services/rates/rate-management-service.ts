import { logger } from '../logger'
import { FairWorkService } from '../fairwork/fairwork-service'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/supabase'

type BaseRateTemplate = Database['public']['Tables']['rate_templates']['Row']

interface RateTemplate extends BaseRateTemplate {
  type?: 'fairwork' | 'custom'
  location_adjustment?: number
  skill_adjustment?: number
}

interface RateCalculationResult {
  baseRate: number
  adjustments: {
    type: string
    amount: number
  }[]
  totalRate: number
  metadata?: {
    configId?: string
  }
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
}

class RateManagementError extends Error {
  constructor(message: string, public details?: Record<string, unknown>) {
    super(message)
    this.name = 'RateManagementError'
  }
}

export class RateManagementService {
  private fairWorkService: FairWorkService
  private readonly supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  constructor(fairWorkService: FairWorkService) {
    this.fairWorkService = fairWorkService
  }

  private handleError(err: unknown, context: string): never {
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error(`Rate management error: ${context}`, {
      message: error.message,
      context,
    })
    throw new RateManagementError({
      message: error.message,
      code: 'RATE_ERROR',
      cause: error,
    })
  }

  async syncFairWorkRates(): Promise<void> {
    try {
      logger.info('Starting FairWork rate sync')

      const minWage = await this.fairWorkService.getBaseRate({
        awardCode: 'MA000001',
        classificationCode: 'L1',
        date: new Date()
      })

      const { data: templates, error } = await this.supabase
        .from('rate_templates')
        .select('*')
        .eq('type', 'fairwork')

      if (error) {
        throw new RateManagementError('Failed to fetch templates', { error })
      }

      if (!templates) {
        throw new RateManagementError('No templates found')
      }

      for (const template of templates) {
        try {
          await this.updateRateTemplate({
            ...template,
            base_rate: minWage,
            updated_at: new Date().toISOString(),
          })
        } catch (error) {
          this.handleError(error, 'Error updating template during sync')
        }
      }
    } catch (error) {
      this.handleError(error, 'Failed to sync FairWork rates')
    }
  }

  async calculateRate(template: RateTemplate): Promise<RateCalculationResult> {
    try {
      logger.info('Calculating rate', { templateId: template.id })

      let baseRate = template.base_rate

      if (template.type === 'fairwork') {
        baseRate = await this.fairWorkService.getBaseRate({
          awardCode: 'MA000001',
          classificationCode: 'L1',
          date: new Date()
        })
      }

      const adjustments: RateCalculationResult['adjustments'] = []

      if (template.location_adjustment) {
        adjustments.push({
          type: 'location',
          amount: baseRate * (template.location_adjustment / 100)
        })
      }

      if (template.skill_adjustment) {
        adjustments.push({
          type: 'skill',
          amount: baseRate * (template.skill_adjustment / 100)
        })
      }

      const totalRate = baseRate + adjustments.reduce((sum, adj) => sum + adj.amount, 0)

      return {
        baseRate,
        adjustments,
        totalRate,
        metadata: {
          configId: template.id
        }
      }
    } catch (error) {
      this.handleError(error, 'Failed to calculate rate')
    }
  }

  async validateRateTemplate(template: RateTemplate): Promise<ValidationResult> {
    try {
      // Validate template structure
      if (!template.base_rate || template.base_rate <= 0) {
        throw new Error('Base rate must be greater than 0')
      }

      // Add more validation rules as needed
      return {
        isValid: true,
        errors: [],
      }
    } catch (error) {
      this.handleError(error, 'Failed to validate rate template')
    }
  }

  async createRateTemplate(template: Omit<RateTemplate, 'id'>): Promise<RateTemplate> {
    try {
      const { data, error } = await this.supabase
        .from('rate_templates')
        .insert(template)
        .select()
        .single()

      if (error) {
        throw error
      }

      if (!data) {
        throw new Error('No template data returned after creation')
      }

      return data
    } catch (error) {
      this.handleError(error, 'Failed to create rate template')
    }
  }

  async updateRateTemplate(template: RateTemplate): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('rate_templates')
        .update(template)
        .eq('id', template.id)

      if (error) {
        throw error
      }
    } catch (error) {
      this.handleError(error, 'Failed to update rate template')
    }
  }

  async deleteRateTemplate(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('rate_templates')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }
    } catch (error) {
      this.handleError(error, 'Failed to delete rate template')
    }
  }

  async getRateTemplate(templateId: string): Promise<RateTemplate> {
    try {
      const { data, error } = await this.supabase
        .from('rate_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (error) {
        throw error
      }

      if (!data) {
        throw new Error('Template not found')
      }

      return data
    } catch (error) {
      this.handleError(error, 'Failed to get rate template')
    }
  }

  async getRateTemplates(orgId: string): Promise<RateTemplate[]> {
    try {
      const { data, error } = await this.supabase
        .from('rate_templates')
        .select('*')
        .eq('org_id', orgId)

      if (error) {
        throw error
      }

      if (!data) {
        return []
      }

      return data
    } catch (error) {
      this.handleError(error, 'Failed to list rate templates')
    }
  }

  async saveTemplate(template: RateTemplate): Promise<RateTemplate> {
    try {
      const { data, error } = await this.supabase
        .from('rate_templates')
        .upsert(template)
        .select()
        .single()

      if (error) {
        throw error
      }

      if (!data) {
        throw new Error('Failed to save template')
      }

      return data
    } catch (error) {
      this.handleError(error, 'Failed to save rate template')
    }
  }
}
