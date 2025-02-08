import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { getAwardClassificationDetails } from '@/lib/fairwork';

export async function GET(
  request: NextRequest,
  { params }: { params: { awardCode: string; classificationCode: string } }
): Promise<NextResponse> {
  const { awardCode, classificationCode } = params;

  try {
    const details = await getAwardClassificationDetails(awardCode, classificationCode);
    return NextResponse.json(details);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch details' }, { status: 500 });
  }
}
