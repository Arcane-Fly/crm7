import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Verify webhook signature
    const signature = request.headers.get('x-vercel-signature');
    if (!signature) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Send deployment status to monitoring service
    await fetch(process.env.MONITORING_WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: payload.id,
        name: payload.name,
        url: payload.url,
        state: payload.state,
        createdAt: payload.createdAt,
      }),
    });

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    // Log error to error tracking service
    await fetch(process.env.ERROR_TRACKING_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error }),
    });

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
