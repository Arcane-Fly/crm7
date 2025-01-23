import {
  RateTemplate,
  BulkCalculation,
  RateTemplateHistory,
  RateCalculation,
  RateAnalytics,
} from '@/lib/types/rates'

export enum RateTemplateStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export interface RateManagementService {
  getRateTemplates(params: { orgId: string }): Promise<{ data: RateTemplate[] }>
  getRateTemplateById(id: string): Promise<RateTemplate>
  createRateTemplate(template: Partial<RateTemplate>): Promise<RateTemplate>
  updateRateTemplate(id: string, template: Partial<RateTemplate>): Promise<RateTemplate>
  deleteRateTemplate(id: string): Promise<void>
  getRateTemplateHistory(id: string): Promise<{ data: RateTemplateHistory[] }>
  getAnalytics(params: { orgId: string }): Promise<{ data: RateAnalytics }>
  getBulkCalculations(orgId: string): Promise<{ data: BulkCalculation[] }>
  createBulkCalculation(params: {
    orgId: string
    templateIds: string[]
  }): Promise<{ data: BulkCalculation }>
  updateBulkCalculation(
    orgId: string,
    id: string,
    calculation: Partial<BulkCalculation>
  ): Promise<BulkCalculation>
  deleteBulkCalculation(orgId: string, id: string): Promise<void>
  calculateRates(
    orgId: string,
    templateId: string,
    calculation: RateCalculation
  ): Promise<RateCalculation>
}
