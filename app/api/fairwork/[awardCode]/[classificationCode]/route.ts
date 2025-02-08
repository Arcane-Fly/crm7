import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { ServiceRegistry } from '@/lib/services/service-registry';
import type { FairWorkService } from '@/lib/services/fairwork/fairwork-service';
import { createApiResponse, createErrorResponse } from '@/lib/api/response';

export async function GET(_req: NextRequest): Promise<NextResponse> {
  const serviceRegistry = ServiceRegistry.getInstance();
  try {
    const fairworkService = serviceRegistry.getService<FairWorkService>('fairworkService');
    const awards = await fairworkService.getActiveAwards();
    return createApiResponse({
      awards,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get active awards', { error });
    return createErrorResponse('AWARDS_FETCH_ERROR', 'Failed to get active awards', undefined, 500);
  }
}
