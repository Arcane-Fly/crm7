import { type PrismaClient } from '@prisma/client';
import { logger, type Logger } from './logger';
import { type MetricsService } from './metrics';

export interface ServiceOptions {
  prisma: PrismaClient;
  metrics: MetricsService;
}

export abstract class BaseService {
  protected readonly prisma: PrismaClient;
  protected readonly metrics: MetricsService;
  protected readonly options: ServiceOptions;
  protected readonly logger: Logger;

  constructor(options: ServiceOptions) {
    this.prisma = options.prisma;
    this.metrics = options.metrics;
    this.options = options;
    this.logger = logger.createLogger(this.constructor.name);
  }

  protected async executeServiceMethod<T>(
    methodName: string,
    fn: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<void> {
    const startTime = Date.now();
    const logContext = { methodName, ...context };

    this.logger.debug(`Executing service method`, logContext);

    try {
      const result = await fn();
      const duration = Date.now() - startTime;

      this.metrics.recordServiceMethodDuration(methodName, duration, {
        success: true,
        ...context,
      });

      this.logger.debug(`Service method completed successfully`, {
        ...logContext,
        duration,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.metrics.recordServiceMethodDuration(methodName, duration, {
        success: false,
        error: errorMessage,
        ...context,
      });

      this.logger.error(`Service method failed`, {
        ...logContext,
        duration,
        error: errorMessage,
      });

      throw error;
    }
  }
}
