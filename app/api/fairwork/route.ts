import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { type FairWorkService } from '@/lib/services/fairwork/fairwork-service';
import { ServiceRegistry } from '@/lib/services/service-registry';
import { AppError } from '@/lib/types/errors';

const fairWorkLogger = logger.createLogger('FairWorkAPI');

/**
 * GET /api/fairwork
 * List all awards
 */
export async function GET(_request: NextRequest): Promise<void> {
  const serviceRegistry = ServiceRegistry.getInstance();
  const fairworkService = serviceRegistry.getService<FairWorkService>('fairworkService');

  try {
    const awards = await fairworkService.getActiveAwards();
    return NextResponse.json({
      awards,
      timestamp: new Date().toISOString()
    });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    fairWorkLogger.error('Failed to get active awards', { error });
    return NextResponse.json(
      { error: 'Failed to get active awards' },
      { status: 500 }
    );
  }
}
