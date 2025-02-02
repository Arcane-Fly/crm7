import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { AppError, DatabaseError, ExternalServiceError, ErrorCode } from '@/lib/types/errors';

export interface ServiceOptions {
  readonly name: string;
  readonly version?: string;
  readonly enableMetrics?: boolean;
}

export interface ServiceMetrics {
  requestCount: number;
  errorCount: number;
  lastError?: Error;
  lastRequestTime?: Date;
}

/**
 * Base class for all services providing common functionality
 */
export abstract class BaseService {
  protected readonly prisma = prisma;
  protected readonly metrics: ServiceMetrics = {
    requestCount: 0,
    errorCount: 0,
  };

  constructor(protected readonly options: ServiceOptions) {}

  /**
   * Wraps service method execution with error handling and metrics
   */
  protected async executeServiceMethod<T>(
    methodName: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const startTime = Date.now();
    this.metrics.lastRequestTime = new Date();
    this.metrics.requestCount++;

    try {
      logger.debug(`${this.options.name}.${methodName} started`);
      const result = await operation();

      if (this.options.enableMetrics) {
        const duration = Date.now() - startTime;
        logger.info(`${this.options.name}.${methodName} completed`, {
          duration,
          service: this.options.name,
          method: methodName,
        });
      }

      return result;
    } catch (error: unknown) {
      this.metrics.errorCount++;
      this.metrics.lastError = error instanceof Error ? error : new Error(String(error: unknown));

      // Handle known error types
      if (error instanceof AppError) {
        throw error;
      }

      // Handle Prisma errors
      if (error?.name === 'PrismaClientKnownRequestError') {
        throw new DatabaseError(
          ErrorCode.DATABASE_ERROR,
          'Database operation failed',
          { prismaError: error },
          error,
        );
      }

      // Handle external service errors
      if (error?.name === 'FetchError' || error?.name === 'AxiosError') {
        throw new ExternalServiceError(
          ErrorCode.EXTERNAL_API_ERROR,
          'External service request failed',
          { originalError: error },
          error,
        );
      }

      // Log and rethrow unknown errors
      logger.error(`${this.options.name}.${methodName} failed`, {
        error,
        service: this.options.name,
        method: methodName,
      });

      throw new AppError({
        code: ErrorCode.INTERNAL_ERROR,
        message: `${this.options.name} service error`,
        status: 500,
        details: { method: methodName },
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Get current service metrics
   */
  public getMetrics(): ServiceMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset service metrics
   */
  public resetMetrics(): void {
    this.metrics.requestCount = 0;
    this.metrics.errorCount = 0;
    this.metrics.lastError = undefined;
    this.metrics.lastRequestTime = undefined;
  }
}
