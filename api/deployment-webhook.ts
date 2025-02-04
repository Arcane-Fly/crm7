import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('Authorization');
  const expectedToken = process.env['DEPLOYMENT_WEBHOOK_TOKEN'];

  if (authHeader !== `Bearer ${expectedToken}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const monitoringUrl = process.env['MONITORING_WEBHOOK_URL'];
    if (typeof monitoringUrl !== "undefined" && monitoringUrl !== null) {
      await fetch(monitoringUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'deployment_started' }),
      });
    }

    // Process deployment
    // ... deployment logic here ...

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    const errorTrackingUrl = process.env['ERROR_TRACKING_URL'];
    if (typeof errorTrackingUrl !== "undefined" && errorTrackingUrl !== null) {
      await fetch(errorTrackingUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      });
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
