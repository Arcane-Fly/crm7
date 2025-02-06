import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getAllowances } from '@/lib/services/fairwork/allowances';
import { createApiResponse, createErrorResponse } from '@/lib/api/response';

const querySchema = z.object({
  awardCode: z.string(),
  classificationCode: z.string(),
  date: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: { awardCode: string; classificationCode: string } }) {
  const query = querySchema.safeParse(req.query);

  if (!query.success) {
    return createErrorResponse('INVALID_QUERY', 'Invalid query parameters', query.error.errors, 400);
  }

  try {
    const allowances = await getAllowances(
      params.awardCode,
      params.classificationCode
    );
    return createApiResponse(allowances);
  } catch (error) {
    return createErrorResponse('ALLOWANCES_FETCH_ERROR', 'Failed to fetch allowances', error, 500);
  }
}
