// External imports
import crypto from 'crypto';

import { type NextApiHandler, type NextApiRequest, type NextApiResponse } from 'next';

// Internal imports
import { monitorAPIEndpoint } from '@/lib/monitoring';
import { logger } from '@/lib/services/logger';

// Types
interface TimeResponse {
  currentTime: string;
  requestedAt: string;
}

interface ErrorResponse {
  error: string;
  code: string;
  requestId?: string;
}

class ExtendedError extends Error {
  requestId?: string;

  constructor(message: string, requestId?: string) {
    super(message);
    this.name = 'ExtendedError';
    this.requestId = requestId;
  }
}

/**
 * API handler for getting the current time
 * Returns ISO formatted timestamp and request metadata
 */
const handler: NextApiHandler<TimeResponse | ErrorResponse> = async (
  _req: NextApiRequest,
  res: NextApiResponse<TimeResponse | ErrorResponse>,
): Promise<void> => {
  const requestId = crypto.randomUUID();
  const requestedAt = new Date().toISOString();

  try {
    logger.info('Processing time request', { requestId, requestedAt });

    const currentTime = new Date().toISOString();
    res.status(200).json({
      currentTime,
      requestedAt,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const extendedError = new ExtendedError(errorMessage, requestId);

    logger.error('Failed to process time request', extendedError, {
      requestId,
      requestedAt,
    });

    res.status(500).json({
      error: 'Failed to get current time',
      code: 'INTERNAL_SERVER_ERROR',
      requestId: extendedError.requestId,
    });
  }
};

// Export monitored endpoint
export default monitorAPIEndpoint(handler);
