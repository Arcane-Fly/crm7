import { NextRequest, NextResponse } from 'next/server';
import { getAllowances } from '@/lib/services/fairwork/allowances';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  const awardCode = searchParams.get('awardCode');
  const classificationCode = searchParams.get('classificationCode');

  try {
    const allowances = await getAllowances(awardCode, classificationCode);
    return NextResponse.json({ allowances });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch allowances' }, { status: 500 });
  }
}
