import { NextResponse } from 'next/server';
import { FairWorkClient, FairWorkApiError } from '@/lib/fairwork/client';
import { ApiResponse, RouteParams } from '@/lib/types/route';

const fairworkClient = new FairWorkClient();

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { rate } = await request.json();

    if (!rate || typeof rate !== 'number') {
      return NextResponse.json(
        {
          error: {
            message: 'Invalid rate provided',
            code: 'INVALID_RATE',
          },
          status: 400,
        } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const isValid = await fairworkClient.validatePayRate(
      params.awardCode,
      params.classificationCode,
      rate
    );

    return NextResponse.json(
      {
        data: { valid: isValid },
        status: 200,
      } as ApiResponse<{ valid: boolean }>,
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof FairWorkApiError) {
      return NextResponse.json(
        {
          error: {
            message: error.message,
            code: 'FAIRWORK_API_ERROR',
            details: error.context,
          },
          status: error.statusCode,
        } as ApiResponse<never>,
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
        },
        status: 500,
      } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
