import { RateManagementService } from './rate-management-service'
import { FairWorkService } from '../fairwork/fairwork-service'
import type {
  RateTemplate,
  RatesService,
  RateTemplateStatus,
  BulkCalculation,
  BulkCalculationParams,
} from '@/lib/types/rates'
import { createLogger } from '@/lib/utils/logger'

const logger = createLogger('RatesService')
const fairWorkService = new FairWorkService()
const rateManagementService = new RateManagementService(fairWorkService)

const ratesService: RatesService = {
  // Template Management
  getTemplates: async ({ orgId }) => {
    try {
      const data = await rateManagementService.getRateTemplates(orgId)
      return { data }
    } catch (error) {
      logger.error('Failed to get templates', { error, orgId })
      throw error
    }
  },

  getRateTemplateById: async (id: string): Promise<RateTemplate> => {
    try {
      const template = await rateManagementService.getRateTemplateById(id)
      if (!template) {
        throw new Error(`Template ${id} not found`)
      }
      return template
    } catch (error) {
      logger.error('Failed to get template', { error, id })
      throw error
    }
  },

  createRateTemplate: async (template: Partial<RateTemplate>): Promise<RateTemplate> => {
    try {
      // Convert Partial<RateTemplate> to Omit<RateTemplate, "id"> by providing defaults
      const fullTemplate: Omit<RateTemplate, 'id'> = {
        name: template.name || '',
        orgId: template.orgId || '',
        templateType: template.templateType || 'hourly',
        baseRate: template.baseRate || 0,
        baseMargin: template.baseMargin || 0,
        superRate: template.superRate || 0,
        leaveLoading: template.leaveLoading || 0,
        workersCompRate: template.workersCompRate || 0,
        payrollTaxRate: template.payrollTaxRate || 0,
        trainingCostRate: template.trainingCostRate || 0,
        otherCostsRate: template.otherCostsRate || 0,
        fundingOffset: template.fundingOffset || 0,
        casualLoading: template.casualLoading || 0,
        effectiveFrom: template.effectiveFrom || null,
        effectiveTo: template.effectiveTo || null,
        status: template.status || 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: template.createdBy || '',
        updatedBy: template.updatedBy || '',
        version: template.version || 1,
        description: template.description || '',
      }
      return rateManagementService.createRateTemplate(fullTemplate)
    } catch (error) {
      logger.error('Failed to create template', { error, template })
      throw error
    }
  },

  updateRateTemplate: async (id: string, template: Partial<RateTemplate>) => {
    try {
      return rateManagementService.updateRateTemplate(id, template)
    } catch (error) {
      logger.error('Failed to update template', { error, id, template })
      throw error
    }
  },

  updateRateTemplateStatus: async (id: string, status: RateTemplateStatus, updatedBy: string) => {
    try {
      await rateManagementService.updateRateTemplateStatus(id, status, updatedBy)
    } catch (error) {
      logger.error('Failed to update template status', { error, id, status })
      throw error
    }
  },

  deleteRateTemplate: async (id: string) => {
    try {
      await rateManagementService.deleteRateTemplate(id)
    } catch (error) {
      logger.error('Failed to delete template', { error, id })
      throw error
    }
  },

  getRateTemplateHistory: async (id: string) => {
    try {
      const data = await rateManagementService.getRateTemplateHistory(id)
      return { data }
    } catch (error) {
      logger.error('Failed to get template history', { error, id })
      throw error
    }
  },

  getRateCalculations: async (id: string) => {
    try {
      const data = await rateManagementService.getRateCalculations(id)
      return { data }
    } catch (error) {
      logger.error('Failed to get rate calculations', { error, id })
      throw error
    }
  },

  // Rate Calculations
  validateRateTemplate: async (template: RateTemplate) => {
    try {
      return rateManagementService.validateRateTemplate(template)
    } catch (error) {
      logger.error('Failed to validate template', { error, template })
      throw error
    }
  },

  calculateRate: async (template: RateTemplate) => {
    try {
      return rateManagementService.calculateRate(template)
    } catch (error) {
      logger.error('Failed to calculate rate', { error, template })
      throw error
    }
  },

  generateQuote: async () => {
    try {
      return { data: {} }
    } catch (error) {
      logger.error('Failed to generate quote', { error })
      throw error
    }
  },

  // Bulk Operations
  getBulkCalculations: async (orgId: string) => {
    try {
      const data = await rateManagementService.getBulkCalculations(orgId)
      return { data }
    } catch (error) {
      logger.error('Failed to get bulk calculations', { error, orgId })
      throw error
    }
  },

  createBulkCalculation: async (
    params: BulkCalculationParams
  ): Promise<{ data: BulkCalculation }> => {
    try {
      const calculation = {
        orgId: params.orgId,
        status: 'pending',
        results: params.templateIds.map((id) => ({ templateId: id, rate: 0 })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Omit<BulkCalculation, 'id'>
      const result = await rateManagementService.createBulkCalculation(calculation)
      return { data: result }
    } catch (error) {
      logger.error('Failed to create bulk calculation', { error, params })
      throw error
    }
  },

  // Analytics and Employee Management
  getAnalytics: async ({ orgId }: { orgId: string }) => {
    try {
      const data = await rateManagementService.getAnalytics(orgId)
      return { data }
    } catch (error) {
      logger.error('Failed to get analytics', { error, orgId })
      throw error
    }
  },

  getEmployees: async () => {
    try {
      return { data: [] }
    } catch (error) {
      logger.error('Failed to get employees', { error })
      throw error
    }
  },
}

export { ratesService }
export type { RateTemplate, RatesService }
