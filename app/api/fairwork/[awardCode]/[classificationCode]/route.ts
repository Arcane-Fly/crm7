import { NextRequest, NextResponse } from 'next/server';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';

const fairworkClient = new FairWorkClient(process.env.FAIRWORK_API_KEY!);

export async function GET(
  request: NextRequest,
  context: { params: { awardCode: string; classificationCode: string } }
) {
  try {
    const { awardCode, classificationCode } = context.params;
    if (!awardCode || !classificationCode) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const url = new URL(request.url);
    const query = {
      date: url.searchParams.get('date') || undefined,
      employmentType: url.searchParams.get('employmentType') || undefined,
    };

    const rates = await fairworkClient.getRates(awardCode, classificationCode, query);
    return NextResponse.json(rates);
  } catch (error) {
    console.error('Error fetching rates:', error);
    return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 500 });
  }
}
