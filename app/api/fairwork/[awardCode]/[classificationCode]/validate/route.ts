import { type NextRequest } from 'next/server';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';
import { defaultConfig } from '@/lib/services/fairwork/fairwork.config';
import { createApiResponse } from '@/lib/api/response';
import { ValidateSchema } from '@/lib/schemas/fairwork';

const fairworkClient = new FairWorkClient(defaultConfig);

export async function POST(
  req: NextRequest,
  context: { params: { awardCode: string; classificationCode: string } }
): Promise<void> {
  try {
    const body = await req.json();
    const params = ValidateSchema.parse(body);
    
    const validationResult = await fairworkClient.validateRate(
      context.params.awardCode,
      context.params.classificationCode,
      params
    );
    
    return createApiResponse(validationResult);
  } catch (error) {
    return createApiResponse({ error: 'Validation failed' }, { status: 400 });
  }
}
