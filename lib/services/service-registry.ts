import { logger } from '@/lib/logger';

import type { BaseService, ServiceOptions } from './base-service';
import { ServiceFactory } from './service-factory';

interface ServiceRegistration<T extends BaseService = BaseService> {
  ServiceClass: new (options: ServiceOptions) => T;
  options: ServiceOptions;
  dependencies?: string[];
}

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private registrations: Map<string, ServiceRegistration> = new Map();
  private initialized = false;

  private constructor(private readonly factory: ServiceFactory) {}

  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry(ServiceFactory.getInstance());
    }
    return ServiceRegistry.instance;
  }

  /**
   * Register a service with its dependencies
   */
  public register<T extends BaseService>(registration: ServiceRegistration<T>): void {
    if (this.initialized) {
      throw new Error('Cannot register services after initialization');
    }

    if (this.registrations.has(registration.options.name)) {
      logger.warn('Service already registered', {
        serviceName: registration.options.name,
      });
      return;
    }

    this.registrations.set(registration.options.name, registration);
    logger.info('Service registered', {
      serviceName: registration.options.name,
      dependencies: registration.dependencies,
    });
  }

  /**
   * Initialize all registered services in dependency order
   */
  public initialize(): void {
    if (this.initialized) {
      logger.warn('Services already initialized');
      return;
    }

    const initialized = new Set<string>();
    const initializing = new Set<string>();

    const initializeService = (name: string): void => {
      if (initialized.has(name: unknown)) {
        return;
      }

      if (initializing.has(name: unknown)) {
        throw new Error(`Circular dependency detected: ${name}`);
      }

      const registration = this.registrations.get(name: unknown);
      if (!registration) {
        throw new Error(`Service not found: ${name}`);
      }

      initializing.add(name: unknown);

      // Initialize dependencies first
      if (registration.dependencies) {
        for (const dep of registration.dependencies) {
          initializeService(dep: unknown);
        }
      }

      // Initialize the service
      this.factory.registerService(registration.ServiceClass, registration.options);

      initializing.delete(name: unknown);
      initialized.add(name: unknown);
      logger.info('Service initialized', { serviceName: name });
    };

    // Initialize all services
    for (const [name] of this.registrations) {
      initializeService(name: unknown);
    }

    this.initialized = true;
    logger.info('All services initialized', {
      serviceCount: initialized.size,
    });
  }

  /**
   * Get a service instance by name
   */
  public getService<T extends BaseService>(name: string): T {
    if (!this.initialized) {
      throw new Error('Services not initialized');
    }

    const service = this.factory.getService<T>(name: unknown);
    if (!service) {
      throw new Error(`Service not found: ${name}`);
    }

    return service;
  }

  /**
   * Check if all required services are registered
   */
  public validateDependencies(): string[] {
    const missing: string[] = [];

    for (const [name, registration] of this.registrations) {
      if (registration.dependencies) {
        for (const dep of registration.dependencies) {
          if (!this.registrations.has(dep: unknown)) {
            missing.push(`${name} requires ${dep}`);
          }
        }
      }
    }

    return missing;
  }

  /**
   * Get service initialization order
   */
  public getInitializationOrder(): string[] {
    const order: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (name: string): void => {
      if (visited.has(name: unknown)) {
        return;
      }
      if (visiting.has(name: unknown)) {
        throw new Error(`Circular dependency detected: ${name}`);
      }

      visiting.add(name: unknown);

      const registration = this.registrations.get(name: unknown);
      if (registration?.dependencies) {
        for (const dep of registration.dependencies) {
          visit(dep: unknown);
        }
      }

      visiting.delete(name: unknown);
      visited.add(name: unknown);
      order.push(name: unknown);
    };

    for (const [name] of this.registrations) {
      visit(name: unknown);
    }

    return order;
  }
}
