import { logger } from '@/lib/logger';

interface ServiceMetrics {
  lastError: Error | null;
  lastErrorTime: Date | null;
  errorCount: number;
}

interface ServiceOptions {
  name: string;
  version: string;
  enableMetrics?: boolean;
}

export class BaseService {
  protected readonly name: string;
  protected readonly version: string;
  private readonly enableMetrics: boolean;
  private readonly metrics: ServiceMetrics;

  constructor(options: ServiceOptions) {
    this.name = options.name;
    this.version = options.version;
    this.enableMetrics = options.enableMetrics ?? true;
    this.metrics = {
      lastError: null,
      lastErrorTime: null,
      errorCount: 0,
    };
  }

  protected async executeServiceMethod<T>(
    methodName: string,
    method: () => Promise<T>
  ): Promise<T> {
    try {
      return await method();
    } catch (error) {
      this.handleError(methodName, error);
      throw error;
    }
  }

  private handleError(methodName: string, error: unknown): void {
    if (this.enableMetrics) {
      this.metrics.lastError = error instanceof Error ? error : new Error(String(error));
      this.metrics.lastErrorTime = new Date();
      this.metrics.errorCount++;
    }

    logger.error(`${this.name}.${methodName} error:`, error);
  }

  public getMetrics(): ServiceMetrics | null {
    return this.enableMetrics ? this.metrics : null;
  }
}
