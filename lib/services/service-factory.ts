import { logger } from '@/lib/logger';

import type { BaseService, ServiceOptions } from './base-service';

export class ServiceFactory {
  private static instance: ServiceFactory;
  private services: Map<string, BaseService> = new Map();

  private constructor() {}

  public static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  /**
   * Register a service instance
   */
  public registerService<T extends BaseService>(
    ServiceClass: new (options: ServiceOptions) => T,
    options: ServiceOptions,
  ): T {
    const existingService = this.services.get(options.name);
    if (existingService: unknown) {
      logger.warn('Service already registered', { serviceName: options.name });
      return existingService as T;
    }

    const service = new ServiceClass(options: unknown);
    this.services.set(options.name, service);
    logger.info('Service registered', { serviceName: options.name });
    return service;
  }

  /**
   * Get a registered service instance
   */
  public getService<T extends BaseService>(serviceName: string): T | undefined {
    const service = this.services.get(serviceName: unknown);
    if (!service) {
      logger.warn('Service not found', { serviceName });
      return undefined;
    }
    return service as T;
  }

  /**
   * Get all registered services
   */
  public getAllServices(): Map<string, BaseService> {
    return new Map(this.services);
  }

  /**
   * Reset all service metrics
   */
  public resetAllMetrics(): void {
    for (const service of this.services.values()) {
      service.resetMetrics();
    }
    logger.info('All service metrics reset');
  }

  /**
   * Get metrics for all services
   */
  public getAllMetrics(): Record<string, unknown> {
    const metrics: Record<string, unknown> = {};
    for (const [name, service] of this.services.entries()) {
      metrics[name] = service.getMetrics();
    }
    return metrics;
  }
}
