import { FairWorkClient } from '@/lib/fairwork/client';
import { type RouteParams } from '@/lib/types/route';
import { NextResponse } from 'next/server';

const fairworkClient = new FairWorkClient();

export async function GET(_req: Request, { params }: { params: RouteParams }) {
  try {
    const { awardCode, classificationCode } = params;
    if (!awardCode || !classificationCode) {
      return NextResponse.json(
        { error: 'Missing required parameters: awardCode and classificationCode' },
        { status: 400 }
      );
    }

    const url = new URL(_req.url);
    const query: { date?: string; employmentType?: string } = {
      date: url.searchParams.get('date') || undefined,
      employmentType: url.searchParams.get('employmentType') || undefined,
    };

    const leaveEntitlements = await fairworkClient.getLeaveEntitlements(awardCode, query);
    return NextResponse.json(leaveEntitlements);
  } catch (error) {
    console.error('Failed to fetch leave entitlements:', error);
    return NextResponse.json({ error: 'Failed to fetch leave entitlements' }, { status: 500 });
  }
}
