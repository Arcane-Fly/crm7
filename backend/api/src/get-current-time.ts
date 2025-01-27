import { type APIHandler } from './helpers/endpoint';
import { logger } from '@/lib/services/logger';
import { monitorAPIEndpoint, withMonitoring } from '@/lib/monitoring';

export const getCurrentTime: APIHandler<'get-current-time'> = monitorAPIEndpoint(
  '/api/get-current-time',
)(async () => {
  return await withMonitoring('getCurrentTime', async () => {
    logger.info('getCurrentTime called', {
      timestamp: new Date().toISOString(),
    });

    const currentTime = Date.now();

    logger.info('getCurrentTime completed', {
      timestamp: new Date().toISOString(),
      responseTime: currentTime,
    });

    return { currentTime };
  });
});
