import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiResponse } from '@/lib/api/response';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';

const validateParamsSchema = z.object({
  awardCode: z.string(),
  classificationCode: z.string(),
});

type RouteParams = z.infer<typeof validateParamsSchema>;

type RouteContext = {
  params: Promise<RouteParams>;
};

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  try {
    const params = await context.params;
    const validatedParams = validateParamsSchema.parse(params);
    
    const body = await request.json();
    
    const client = new FairWorkClient({
      apiKey: process.env.FAIRWORK_API_KEY!,
      apiUrl: process.env.FAIRWORK_API_URL!,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
      timeout: 5000,
    });

    const validation = await client.validatePayRate(
      validatedParams.awardCode,
      validatedParams.classificationCode,
      body.rate
    );

    return createApiResponse(validation);
  } catch (error) {
    return createApiResponse(undefined, {
      code: 'INVALID_REQUEST',
      message: error instanceof Error ? error.message : 'Invalid request',
    });
  }
}
