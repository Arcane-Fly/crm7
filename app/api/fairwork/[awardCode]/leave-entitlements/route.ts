import { type NextRequest } from 'next/server';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';
import { defaultConfig } from '@/lib/services/fairwork/fairwork.config';
import { createApiResponse } from '@/lib/api/response';
import { DateParamsSchema } from '@/lib/schemas/fairwork';

const fairworkClient = new FairWorkClient(defaultConfig);

export async function GET(
  req: NextRequest,
  context: { params: { awardCode: string } }
): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const params = DateParamsSchema.parse(Object.fromEntries(searchParams));
    
    const entitlements = await fairworkClient.getLeaveEntitlements(
      context.params.awardCode,
      params
    );
    
    return createApiResponse(entitlements);
  } catch (error) {
    return createApiResponse({ error: 'Failed to fetch leave entitlements' }, { status: 500 });
  }
}
