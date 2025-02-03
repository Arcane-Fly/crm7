import { type NextRequest } from 'next/server';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';
import { defaultConfig } from '@/lib/services/fairwork/fairwork.config';
import { createApiResponse } from '@/lib/api/response';

const fairworkClient = new FairWorkClient(defaultConfig);

export async function GET(
  req: NextRequest,
  context: { params: { awardCode: string; classificationCode: string } }
): Promise<Response> {
  try {
    const classification = await fairworkClient.getClassification(
      context.params.awardCode,
      context.params.classificationCode
    );
    
    return createApiResponse(classification);
  } catch (error) {
    return createApiResponse({ error: 'Failed to fetch classification' }, { status: 500 });
  }
}
