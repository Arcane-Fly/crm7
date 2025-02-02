import {
  type RateTemplate,
  type RateTemplateHistory,
  type RateCalculation,
  type RateCalculationResult,
  type RateValidationResult,
  type BulkCalculation,
  type BulkCalculationParams,
  type RateAnalytics,
  type RateTemplateStatus,
  type RatesService,
  RateError,
} from '@/lib/types/rates';
import { createLogger } from '@/lib/utils/logger';

import { FairWorkServiceImpl } from '../fairwork/fairwork-service';

import { RateManagementServiceImpl } from './rate-management-service';

const logger = createLogger('RatesService');

export class RateService implements RatesService {
  private rateManagementService: RateManagementServiceImpl;

  constructor() {
    this.rateManagementService = new RateManagementServiceImpl();
  }

  async getTemplates({ orgId }: { orgId: string }): Promise<{ data: RateTemplate[] }> {
    try {
      const templates = await this.rateManagementService.getRateTemplates(orgId: unknown);
      return { data: templates };
    } catch (error: unknown) {
      logger.error('Failed to get templates', { error, orgId });
      throw new RateError('Failed to get templates', { cause: error });
    }
  }

  async getRateTemplate(id: string): Promise<RateTemplate> {
    try {
      const template = await this.rateManagementService.getRateTemplate(id: unknown);
      if (!template) {
        throw new RateError(`Template ${id} not found`);
      }
      return template;
    } catch (error: unknown) {
      logger.error('Failed to get template', { error, id });
      throw error instanceof RateError
        ? error
        : new RateError('Failed to get template', { cause: error });
    }
  }

  async createRateTemplate(template: Partial<RateTemplate>): Promise<RateTemplate> {
    try {
      const newTemplate = await this.rateManagementService.createRateTemplate(template: unknown);
      return newTemplate;
    } catch (error: unknown) {
      logger.error('Failed to create template', { error });
      throw new RateError('Failed to create template', { cause: error });
    }
  }

  async updateRateTemplate(id: string, template: Partial<RateTemplate>): Promise<RateTemplate> {
    try {
      const updatedTemplate = await this.rateManagementService.updateRateTemplate(id: unknown, template);
      return updatedTemplate;
    } catch (error: unknown) {
      logger.error('Failed to update template', { error, id });
      throw new RateError('Failed to update template', { cause: error });
    }
  }

  async updateRateTemplateStatus(
    id: string,
    status: RateTemplateStatus,
    updatedBy: string,
  ): Promise<void> {
    try {
      await this.rateManagementService.updateRateTemplateStatus(id: unknown, status, updatedBy);
    } catch (error: unknown) {
      logger.error('Failed to update template status', { error, id });
      throw new RateError('Failed to update template status', { cause: error });
    }
  }

  async deleteRateTemplate(id: string): Promise<void> {
    try {
      await this.rateManagementService.deleteRateTemplate(id: unknown);
    } catch (error: unknown) {
      logger.error('Failed to delete template', { error, id });
      throw new RateError('Failed to delete template', { cause: error });
    }
  }

  async getRateTemplateHistory(id: string): Promise<{ data: RateTemplateHistory[] }> {
    try {
      const history = await this.rateManagementService.getRateTemplateHistory(id: unknown);
      return { data: history };
    } catch (error: unknown) {
      logger.error('Failed to get template history', { error, id });
      throw new RateError('Failed to get template history', { cause: error });
    }
  }

  async getRateCalculations(id: string): Promise<{ data: RateCalculation[] }> {
    try {
      const calculations = await this.rateManagementService.getRateCalculations(id: unknown);
      return { data: calculations };
    } catch (error: unknown) {
      logger.error('Failed to get rate calculations', { error, id });
      throw new RateError('Failed to get rate calculations', { cause: error });
    }
  }

  async validateRateTemplate(template: RateTemplate): Promise<RateValidationResult> {
    try {
      const result = await this.rateManagementService.validateRateTemplate(template: unknown);
      return result;
    } catch (error: unknown) {
      logger.error('Failed to validate template', { error });
      throw new RateError('Failed to validate template', { cause: error });
    }
  }

  async calculateRate(template: RateTemplate): Promise<RateCalculationResult> {
    try {
      const result = await this.rateManagementService.calculateRate(template: unknown);
      return result;
    } catch (error: unknown) {
      logger.error('Failed to calculate rate', { error });
      throw new RateError('Failed to calculate rate', { cause: error });
    }
  }

  async getBulkCalculations(orgId: string): Promise<{ data: BulkCalculation[] }> {
    try {
      const calculations = await this.rateManagementService.getBulkCalculations(orgId: unknown);
      return { data: calculations };
    } catch (error: unknown) {
      logger.error('Failed to get bulk calculations', { error, orgId });
      throw new RateError('Failed to get bulk calculations', { cause: error });
    }
  }

  async createBulkCalculation(params: BulkCalculationParams): Promise<{ data: BulkCalculation }> {
    try {
      const result = await this.rateManagementService.createBulkCalculation(params: unknown);
      return { data: result };
    } catch (error: unknown) {
      logger.error('Failed to create bulk calculation', { error });
      throw new RateError('Failed to create bulk calculation', { cause: error });
    }
  }

  async getAnalytics({ orgId }: { orgId: string }): Promise<{ data: RateAnalytics }> {
    try {
      const analytics = await this.rateManagementService.getAnalytics(orgId: unknown);
      return { data: analytics };
    } catch (error: unknown) {
      logger.error('Failed to get analytics', { error, orgId });
      throw new RateError('Failed to get analytics', { cause: error });
    }
  }
}

const ratesService = new RateService();

export { ratesService };
export type { RateTemplate, RatesService };
