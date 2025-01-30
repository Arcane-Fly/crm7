import { fairWorkCacheWarming } from '@/lib/services/fairwork/cache-warming';
import { logger } from '@/lib/services/logger';

/**
 * Initialize all application services that need to be started when the app boots.
 * This includes:
 * - Cache warming for frequently accessed data
 * - Monitoring services
 * - Background jobs
 */
export async function initializeServices(): Promise<void> {
  try {
    logger.info('Initializing application services...');

    // Initialize cache warming
    logger.info('Starting cache warming service...');
    fairWorkCacheWarming.initialize();

    // Add other service initializations here
    // e.g., background jobs, monitoring services, etc.

    logger.info('Application services initialized successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to initialize application services:', new Error(errorMessage));
    throw error;
  }
}

/**
 * Cleanup all application services during shutdown.
 * This ensures graceful shutdown of services like:
 * - Cache warming
 * - Background jobs
 * - Database connections
 */
export async function cleanupServices(): Promise<void> {
  try {
    logger.info('Cleaning up application services...');

    // Stop cache warming
    fairWorkCacheWarming.stop();

    // Add other service cleanup here

    logger.info('Application services cleaned up successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to cleanup application services:', new Error(errorMessage));
    throw error;
  }
}

// Register cleanup handlers
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    void cleanupServices();
  });
}

if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => {
    void cleanupServices().finally(() => process.exit(0));
  });

  process.on('SIGINT', () => {
    void cleanupServices().finally(() => process.exit(0));
  });
}
