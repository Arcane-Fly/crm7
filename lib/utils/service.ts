import { type PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { type MetricsService } from './metrics';

export interface ServiceOptions {
  prisma: PrismaClient;
  metrics: MetricsService;
}

export abstract class BaseService {
  protected readonly prisma: PrismaClient;
  protected readonly metrics: MetricsService;
  protected readonly options: ServiceOptions;

  constructor(options: ServiceOptions) {
    this.prisma = options.prisma;
    this.metrics = options.metrics;
    this.options = options;
  }

  protected async executeServiceMethod<T>(
    methodName: string,
    fn: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await fn();
      const duration = Date.now() - startTime;

      this.metrics.recordServiceMethodDuration(methodName, duration, {
        success: true,
        ...context,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.metrics.recordServiceMethodDuration(methodName, duration, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        ...context,
      });

      throw error;
    }
  }
}
