import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient, PostgrestError } from '@supabase/supabase-js';

import { logger } from '@/lib/services/logger';
import {
  type RateTemplate,
  type RateTemplateInput,
  type RateTemplateUpdate,
  type RateTemplateStatus,
  type BulkCalculation,
  type RateAnalytics,
  type RateValidationResult,
  type RateTemplateHistory,
} from '@/lib/types/rates';

interface LogError extends Error {
  context: string;
  code?: string;
  [key: string]: unknown;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

interface CustomError extends Error {
  details?: Record<string, unknown>;
  code?: string;
}

export class RateManagementError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'RateManagementError';
  }
}

export class RateManagementService {
  private readonly client: SupabaseClient;
  private readonly fairWorkService: any;

  constructor(fairWorkService?: any) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    this.client = createClient(SUPABASE_URL, SUPABASE_KEY);
    this.fairWorkService = fairWorkService;
  }

  async getRateTemplates(orgId: string): Promise<RateTemplate[]> {
    try {
      const { data, error } = await this.client
        .from('rate_templates')
        .select('*')
        .eq('orgId', orgId)
        .order('createdAt', { ascending: false });

      if (error) {
        const customError = new Error(error.message) as CustomError;
        customError.details = { code: error.code };
        throw customError;
      }

      return data.map(this.mapToRateTemplate);
    } catch (error) {
      const customError = error as PostgrestError;
      const logError = new Error(customError.message) as LogError;
      logError.context = 'getRateTemplates';
      logError.code = customError.code;
      logError.orgId = orgId;
      logger.error('Error fetching rate templates', logError);
      throw new RateManagementError('Failed to fetch rate templates', error);
    }
  }

  async getRateTemplate(id: string): Promise<RateTemplate | null> {
    if (!id) {
      throw new Error('Template ID is required');
    }

    try {
      const { data, error } = await this.client
        .from('rate_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        const customError = new Error(error.message) as CustomError;
        customError.details = { code: error.code };
        throw customError;
      }

      return data ? this.mapToRateTemplate(data) : null;
    } catch (error) {
      const customError = error as PostgrestError;
      const logError = new Error(customError.message) as LogError;
      logError.context = 'getRateTemplate';
      logError.code = customError.code;
      logError.id = id;
      logger.error('Error fetching rate template', logError);
      throw new RateManagementError('Failed to fetch rate template', error);
    }
  }

  async createRateTemplate(template: Omit<RateTemplateInput, 'id'>): Promise<RateTemplate> {
    try {
      const { data, error } = await this.client
        .from('rate_templates')
        .insert([this.mapFromRateTemplate(template)])
        .select()
        .single();

      if (error) {
        const customError = new Error(error.message) as CustomError;
        customError.details = { code: error.code };
        throw customError;
      }

      return this.mapToRateTemplate(data);
    } catch (error) {
      const customError = error as PostgrestError;
      const logError = new Error(customError.message) as LogError;
      logError.context = 'createRateTemplate';
      logError.code = customError.code;
      logger.error('Error creating rate template', logError);
      throw new RateManagementError('Failed to create rate template', error);
    }
  }

  async updateRateTemplate(id: string, updates: RateTemplateUpdate): Promise<RateTemplate> {
    try {
      const { data, error } = await this.client
        .from('rate_templates')
        .update(this.mapFromRateTemplate(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) {
        const customError = new Error(error.message) as CustomError;
        customError.details = { code: error.code };
        throw customError;
      }

      return this.mapToRateTemplate(data);
    } catch (error) {
      const customError = error as PostgrestError;
      const logError = new Error(customError.message) as LogError;
      logError.context = 'updateRateTemplate';
      logError.code = customError.code;
      logError.id = id;
      logger.error('Error updating rate template', logError);
      throw new RateManagementError('Failed to update rate template', error);
    }
  }

  private mapToRateTemplate(data: Record<string, unknown>): RateTemplate {
    const templateType = data.templateType as RateTemplate['templateType'];
    if (!['fixed', 'hourly', 'daily'].includes(templateType)) {
      throw new Error(`Invalid template type: ${templateType}`);
    }

    return {
      id: String(data.id),
      orgId: String(data.orgId),
      name: String(data.name),
      templateType,
      description: data.description ? String(data.description) : null,
      baseRate: Number(data.baseRate),
      baseMargin: Number(data.baseMargin),
      superRate: Number(data.superRate),
      leaveLoading: Number(data.leaveLoading),
      workersCompRate: Number(data.workersCompRate),
      payrollTaxRate: Number(data.payrollTaxRate),
      trainingCostRate: Number(data.trainingCostRate),
      otherCostsRate: Number(data.otherCostsRate),
      fundingOffset: Number(data.fundingOffset),
      casualLoading: Number(data.casualLoading),
      effectiveFrom: String(data.effectiveFrom),
      effectiveTo: data.effectiveTo ? String(data.effectiveTo) : null,
      status: String(data.status) as RateTemplate['status'],
      createdAt: String(data.createdAt),
      updatedAt: String(data.updatedAt),
      createdBy: String(data.createdBy),
      updatedBy: String(data.updatedBy),
      version: Number(data.version),
    };
  }

  async updateRateTemplateStatus(
    id: string,
    status: RateTemplateStatus,
    updatedBy: string,
  ): Promise<RateTemplate> {
    return this.updateRateTemplate(id, { status, updatedBy } as RateTemplateUpdate);
  }

  async deleteRateTemplate(id: string): Promise<void> {
    try {
      const { error } = await this.client.from('rate_templates').delete().eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      const customError = error as PostgrestError;
      const logError = new Error(customError.message) as LogError;
      logError.context = 'deleteRateTemplate';
      logError.code = customError.code;
      logger.error('Error deleting rate template', logError);
      throw new RateManagementError('Failed to delete rate template', error);
    }
  }

  async getRateTemplateHistory(id: string): Promise<RateTemplateHistory[]> {
    try {
      const { data, error } = await this.client
        .from('rate_template_history')
        .select('*')
        .eq('templateId', id)
        .order('changedAt', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      const customError = error as PostgrestError;
      const logError = new Error(customError.message) as LogError;
      logError.context = 'getRateTemplateHistory';
      logError.code = customError.code;
      logger.error('Error fetching rate template history', logError);
      throw new RateManagementError('Failed to fetch rate template history', error);
    }
  }

  async getRateCalculations(id: string): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('rate_calculations')
        .select('*')
        .eq('templateId', id)
        .order('createdAt', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      const customError = error as PostgrestError;
      const logError = new Error(customError.message) as LogError;
      logError.context = 'getRateCalculations';
      logError.code = customError.code;
      logger.error('Error fetching rate calculations', logError);
      throw new RateManagementError('Failed to fetch rate calculations', error);
    }
  }

  async validateRateTemplate(template: RateTemplateInput): Promise<RateValidationResult> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Basic validation
      if (!template.name) {
        errors.push('Template name is required');
      }
      if (!template.templateType) {
        errors.push('Template type is required');
      }

      // Rate type specific validation
      if (template.templateType === 'hourly' && !template.baseRate) {
        errors.push('Base rate is required for hourly templates');
      }

      // Check against Fair Work rates if available
      if (this.fairWorkService && template.baseRate) {
        const fairWorkRate = await this.fairWorkService.getMinimumRate(template);
        if (template.baseRate < fairWorkRate) {
          warnings.push(`Rate is below Fair Work minimum of ${fairWorkRate}`);
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      const customError = error as Error;
      const logError = new Error(customError.message) as LogError;
      logError.context = 'validateRateTemplate';
      logger.error('Error validating rate template', logError);
      throw new RateManagementError('Failed to validate rate template', error);
    }
  }

  async calculateRate(template: RateTemplateInput): Promise<number> {
    try {
      const baseRate = template.baseRate;
      const margin = template.baseMargin / 100;
      const super_rate = template.superRate / 100;
      const leave_loading = template.leaveLoading / 100;
      const workers_comp = template.workersCompRate / 100;
      const payroll_tax = template.payrollTaxRate / 100;
      const training_cost = template.trainingCostRate / 100;
      const other_costs = template.otherCostsRate / 100;
      const funding_offset = template.fundingOffset;
      const casual_loading = template.casualLoading / 100;

      let final_rate = baseRate;
      final_rate *= 1 + margin;
      final_rate *= 1 + super_rate;
      final_rate *= 1 + leave_loading;
      final_rate *= 1 + workers_comp;
      final_rate *= 1 + payroll_tax;
      final_rate *= 1 + training_cost;
      final_rate *= 1 + other_costs;
      final_rate *= 1 + casual_loading;
      final_rate -= funding_offset;

      return Number(final_rate.toFixed(2));
    } catch (error) {
      const customError = error as Error;
      const logError = new Error(customError.message) as LogError;
      logError.context = 'calculateRate';
      logger.error('Error calculating rate', logError);
      throw new RateManagementError('Failed to calculate rate', error);
    }
  }

  async getBulkCalculations(orgId: string): Promise<BulkCalculation[]> {
    try {
      const { data, error } = await this.client
        .from('bulk_calculations')
        .select('*')
        .eq('orgId', orgId)
        .order('createdAt', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      const customError = error as PostgrestError;
      const logError = new Error(customError.message) as LogError;
      logError.context = 'getBulkCalculations';
      logError.code = customError.code;
      logger.error('Error fetching bulk calculations', logError);
      throw new RateManagementError('Failed to fetch bulk calculations', error);
    }
  }

  async createBulkCalculation(calculation: Omit<BulkCalculation, 'id'>): Promise<BulkCalculation> {
    try {
      const { data, error } = await this.client
        .from('bulk_calculations')
        .insert([calculation])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      const customError = error as PostgrestError;
      const logError = new Error(customError.message) as LogError;
      logError.context = 'createBulkCalculation';
      logError.code = customError.code;
      logger.error('Error creating bulk calculation', logError);
      throw new RateManagementError('Failed to create bulk calculation', error);
    }
  }

  async getAnalytics(orgId: string): Promise<RateAnalytics> {
    try {
      const { data: templates, error: templatesError } = await this.client
        .from('rate_templates')
        .select('*')
        .eq('orgId', orgId);

      if (templatesError) {
        throw new Error(templatesError.message);
      }

      const analytics: RateAnalytics = {
        totalTemplates: templates.length,
        activeTemplates: templates.filter((t) => t.status === 'active').length,
        averageRate: templates.reduce((acc, t) => acc + t.baseRate, 0) / templates.length || 0,
        recentChanges: templates.slice(0, 5).map((t) => ({
          templateId: t.id,
          action: 'updated',
          timestamp: t.updatedAt,
        })),
      };

      return analytics;
    } catch (error) {
      const customError = error as PostgrestError;
      const logError = new Error(customError.message) as LogError;
      logError.context = 'getAnalytics';
      logError.code = customError.code;
      logger.error('Error fetching rate analytics', logError);
      throw new RateManagementError('Failed to fetch rate analytics', error);
    }
  }

  private mapFromRateTemplate(
    template: RateTemplateInput | RateTemplateUpdate,
  ): Record<string, unknown> {
    const mapped: Record<string, unknown> = {
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
    };

    if ('id' in template) {
      mapped.id = template.id;
    }

    return mapped;
  }
}
