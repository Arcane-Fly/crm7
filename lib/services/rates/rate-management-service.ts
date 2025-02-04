import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

import {
  type BulkCalculation,
  type RateAnalytics,
  type RateCalculationResult,
  type RateTemplate,
  type RateTemplateHistory,
  type RateTemplateInput,
  type RateTemplateStatus,
  type RateTemplateUpdate,
  type RateValidationResult,
} from '@/lib/types/rates';
import { logger } from '@/lib/utils/logger';

import type { FairWorkService, PayRate } from '../fairwork/index';
import type { Classification } from '../fairwork/types';

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
    public code: string,
  ) {
    super(message);
    this.name = 'RateManagementError';
  }
}

interface ServiceConfig {
  minimumRate: number;
}

interface RateManagementConfig {
  cacheTimeout: number;
  retryAttempts: number;
  retryDelay: number;
}

const DEFAULT_CONFIG: RateManagementConfig = {
  cacheTimeout: 3600000, // 1 hour
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

export interface RateManagementService {
  getRateTemplates(orgId: string): Promise<RateTemplate[]>;
  getRateTemplate(id: string): Promise<RateTemplate | null>;
  createRateTemplate(template: RateTemplateInput): Promise<RateTemplate>;
  updateRateTemplate(id: string, updates: RateTemplateUpdate): Promise<RateTemplate>;
  updateRateTemplateStatus(
    id: string,
    status: RateTemplateStatus,
    updatedBy: string,
  ): Promise<RateTemplate>;
  deleteRateTemplate(id: string): Promise<void>;
  getRateTemplateHistory(id: string): Promise<{ data: RateTemplateHistory[] }>;
  getRateCalculations(id: string): Promise<{ data: RateCalculationResult[] }>;
  validateRateTemplate(template: RateTemplate): Promise<RateValidationResult>;
  calculateRate(template: RateTemplate): Promise<RateCalculationResult>;
  getBulkCalculations(orgId: string): Promise<{ data: BulkCalculation[] }>;
  createBulkCalculation(calculation: Omit<BulkCalculation, 'id'>): Promise<BulkCalculation>;
  getAnalytics(orgId: string): Promise<{ data: RateAnalytics }>;
  getCurrentRates(): Promise<PayRate[]>;
  getRatesForDate(date: Date): Promise<PayRate[]>;
  getClassifications(): Promise<Classification[]>;
  getClassificationHierarchy(): Promise<Classification[]>;
  clearCache(): void;
}

export class RateManagementServiceImpl implements RateManagementService {
  private readonly client: SupabaseClient;
  private readonly fairWorkService: FairWorkService;
  private readonly config: ServiceConfig;
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private rateManagementConfig: RateManagementConfig;

  private constructor(
    fairWorkService: FairWorkService,
    config: Partial<ServiceConfig> = {},
    rateManagementConfig: RateManagementConfig = DEFAULT_CONFIG,
  ) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    this.client = createClient(SUPABASE_URL, SUPABASE_KEY);
    this.fairWorkService = fairWorkService;
    this.config = {
      minimumRate: 25.0,
      ...config,
    };
    this.rateManagementConfig = rateManagementConfig;
  }

  async getRateTemplates(orgId: string): Promise {
    try {
      const { data, error } = await this.client
        .from('rate_templates')
        .select('*')
        .eq('orgId', orgId)
        .order('createdAt', { ascending: false });

      if (typeof error !== 'undefined' && error !== null) {
        const customError = new Error(error.message) as CustomError;
        customError.details = { code: error.code };
        throw customError;
      }

      return data ? data.map((item: Record<string, unknown>) => this.mapToRateTemplate(item)) : [];
    } catch (error) {
      const customError = error as PostgrestError;
      const logError = new Error(customError.message) as LogError;
      logError.context = 'getRateTemplates';
      logError.code = customError.code;
      logger.error('Error fetching rate templates', logError);
      throw new RateManagementError(
        'Failed to fetch rate templates',
        customError.code ?? 'unknown',
      );
    }
  }

  async getRateTemplate(id: string): Promise<void> {
    if (!id) {
      throw new Error('Template ID is required');
    }

    try {
      const { data, error } = await this.client
        .from('rate_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (typeof error !== 'undefined' && error !== null) {
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
      logger.error('Error fetching rate template', logError);
      throw new RateManagementError('Failed to fetch rate template', customError.code ?? 'unknown');
    }
  }

  async createRateTemplate(template: RateTemplateInput): Promise<void> {
    try {
      const mappedTemplate = this.mapFromRateTemplate(template);
      const { data, error } = await this.client
        .from('rate_templates')
        .insert([mappedTemplate])
        .select()
        .single();

      if (typeof error !== 'undefined' && error !== null) {
        const customError = new Error(error.message) as CustomError;
        customError.details = { code: error.code };
        throw customError;
      }

      if (!data) {
        throw new Error('No data returned from insert operation');
      }

      return this.mapToRateTemplate(data);
    } catch (error) {
      const customError = error as PostgrestError;
      const logError = new Error(customError.message) as LogError;
      logError.context = 'createRateTemplate';
      logError.code = customError.code;
      logger.error('Error creating rate template', logError);
      throw new RateManagementError(
        'Failed to create rate template',
        customError.code ?? 'unknown',
      );
    }
  }

  async updateRateTemplate(id: string, updates: RateTemplateUpdate): Promise<void> {
    try {
      const mappedUpdates = this.mapFromRateTemplate(updates);
      const { data, error } = await this.client
        .from('rate_templates')
        .update(mappedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (typeof error !== 'undefined' && error !== null) {
        const customError = new Error(error.message) as CustomError;
        customError.details = { code: error.code };
        throw customError;
      }

      if (!data) {
        throw new Error('No data returned from update operation');
      }

      return this.mapToRateTemplate(data);
    } catch (error) {
      const customError = error as PostgrestError;
      const logError = new Error(customError.message) as LogError;
      logError.context = 'updateRateTemplate';
      logError.code = customError.code;
      logger.error('Error updating rate template', logError);
      throw new RateManagementError(
        'Failed to update rate template',
        customError.code ?? 'unknown',
      );
    }
  }

  async updateRateTemplateStatus(
    id: string,
    status: RateTemplateStatus,
    updatedBy: string,
  ): Promise<void> {
    return this.updateRateTemplate(id, { id, status, updatedBy });
  }

  async deleteRateTemplate(id: string): Promise<void> {
    try {
      const { error } = await this.client.from('rate_templates').delete().eq('id', id);

      if (typeof error !== 'undefined' && error !== null) {
        throw new Error(error.message);
      }
    } catch (error) {
      const customError = error as PostgrestError;
      const logError = new Error(customError.message) as LogError;
      logError.context = 'deleteRateTemplate';
      logError.code = customError.code;
      logger.error('Error deleting rate template', logError);
      throw new RateManagementError(
        'Failed to delete rate template',
        customError.code ?? 'unknown',
      );
    }
  }

  async getRateTemplateHistory(id: string): Promise<void> {
    try {
      const { data, error } = await this.client
        .from('rate_template_history')
        .select('*')
        .eq('templateId', id)
        .order('changedAt', { ascending: false });

      if (typeof error !== 'undefined' && error !== null) {
        throw new Error(error.message);
      }

      return { data: data ?? [] };
    } catch (error) {
      const customError = error as PostgrestError;
      const logError = new Error(customError.message) as LogError;
      logError.context = 'getRateTemplateHistory';
      logError.code = customError.code;
      logger.error('Error fetching rate template history', logError);
      throw new RateManagementError(
        'Failed to fetch rate template history',
        customError.code ?? 'unknown',
      );
    }
  }

  async getRateCalculations(id: string): Promise<void> {
    try {
      const { data, error } = await this.client
        .from('rate_calculations')
        .select('*')
        .eq('templateId', id)
        .order('createdAt', { ascending: false });

      if (typeof error !== 'undefined' && error !== null) {
        throw new Error(error.message);
      }

      return { data: data ?? [] };
    } catch (error) {
      const customError = error as PostgrestError;
      const logError = new Error(customError.message) as LogError;
      logError.context = 'getRateCalculations';
      logError.code = customError.code;
      logger.error('Error fetching rate calculations', logError);
      throw new RateManagementError(
        'Failed to fetch rate calculations',
        customError.code ?? 'unknown',
      );
    }
  }

  async createBulkCalculation(calculation: Omit<BulkCalculation, 'id'>): Promise<void> {
    try {
      const { data, error } = await this.client
        .from('bulk_calculations')
        .insert([calculation])
        .select()
        .single();

      if (typeof error !== 'undefined' && error !== null) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No data returned from insert operation');
      }

      return data;
    } catch (error) {
      const customError = error as PostgrestError;
      const logError = new Error(customError.message) as LogError;
      logError.context = 'createBulkCalculation';
      logError.code = customError.code;
      logger.error('Error creating bulk calculation', logError);
      throw new RateManagementError(
        'Failed to create bulk calculation',
        customError.code ?? 'unknown',
      );
    }
  }

  async getAnalytics(orgId: string): Promise<void> {
    try {
      const { data: templates, error: templatesError } = await this.client
        .from('rate_templates')
        .select('*')
        .eq('orgId', orgId);

      if (typeof templatesError !== 'undefined' && templatesError !== null) {
        throw new Error(templatesError.message);
      }

      const { data: calculations, error: calculationsError } = await this.client
        .from('rate_calculations')
        .select('*')
        .eq('orgId', orgId);

      if (typeof calculationsError !== 'undefined' && calculationsError !== null) {
        throw new Error(calculationsError.message);
      }

      const totalTemplates = templates.length ?? 0;
      const averageRate =
        calculations.reduce((acc, curr) => acc + curr.finalRate, 0) / (calculations.length || 1);

      return {
        data: {
          totalTemplates,
          averageRate,
          lastUpdated: new Date().toISOString(),
        },
      };
    } catch (error) {
      const customError = error as PostgrestError;
      const logError = new Error(customError.message) as LogError;
      logError.context = 'getAnalytics';
      logError.code = customError.code;
      logger.error('Error fetching analytics', logError);
      throw new RateManagementError('Failed to fetch analytics', customError.code ?? 'unknown');
    }
  }

  async getCurrentRates(): Promise<void> {
    const cacheKey = 'currentRates';
    const cached = this.getFromCache(cacheKey);
    if (typeof cached !== 'undefined' && cached !== null) return cached as PayRate[];

    try {
      const rates = await fairWorkService.getCurrentRates();
      this.setInCache(cacheKey, rates);
      return rates;
    } catch (error) {
      logger.error('Failed to fetch current rates:', error);
      throw new Error('Failed to fetch current rates');
    }
  }

  async getRatesForDate(date: Date): Promise<void> {
    const cacheKey = `rates_${date.toISOString()}`;
    const cached = this.getFromCache(cacheKey);
    if (typeof cached !== 'undefined' && cached !== null) return cached as PayRate[];

    try {
      const rates = await fairWorkService.getRatesForDate(date);
      this.setInCache(cacheKey, rates);
      return rates;
    } catch (error) {
      logger.error('Failed to fetch rates for date:', error);
      throw new Error(`Failed to fetch rates for date: ${date.toISOString()}`);
    }
  }

  async getClassifications(): Promise<void> {
    const cacheKey = 'classifications';
    const cached = this.getFromCache(cacheKey);
    if (typeof cached !== 'undefined' && cached !== null) return cached as Classification[];

    try {
      const classifications = await fairWorkService.getClassifications();
      this.setInCache(cacheKey, classifications);
      return classifications;
    } catch (error) {
      logger.error('Failed to fetch classifications:', error);
      throw new Error('Failed to fetch classifications');
    }
  }

  async getClassificationHierarchy(): Promise<void> {
    const cacheKey = 'classificationHierarchy';
    const cached = this.getFromCache(cacheKey);
    if (typeof cached !== 'undefined' && cached !== null) return cached as Classification[];

    try {
      const hierarchy = await fairWorkService.getClassificationHierarchy();
      this.setInCache(cacheKey, hierarchy);
      return hierarchy;
    } catch (error) {
      logger.error('Failed to fetch classification hierarchy:', error);
      throw new Error('Failed to fetch classification hierarchy');
    }
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.rateManagementConfig.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setInCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clearCache(): void {
    this.cache.clear();
  }

  private mapToRateTemplate(data: Record<string, unknown>): RateTemplate {
    return {
      id: String(data.id),
      orgId: String(data.orgId),
      name: String(data.name),
      description: String(data.description ?? ''),
      templateType: String(data.templateType) as RateTemplate['templateType'],
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

  private mapFromRateTemplate(
    template: RateTemplateInput | RateTemplateUpdate,
  ): Record<string, unknown> {
    const mapped: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(template)) {
      if (value !== undefined) {
        mapped[key] = value;
      }
    }

    return mapped;
  }
}

export default RateManagementServiceImpl;
