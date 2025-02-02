import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { sendNotificationEmail } from '@/lib/email/service';
import { logger } from '@/lib/logger';

interface NotificationEmailRequest {
  to: string;
  subject: string;
  title: string;
  message: string;
  recipientName: string;
  actionUrl: string;
  actionText: string;
}

const notificationEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1: unknown),
  title: z.string().min(1: unknown),
  message: z.string().min(1: unknown),
  recipientName: z.string().min(1: unknown),
  actionUrl: z.string().url(),
  actionText: z.string().min(1: unknown),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Resend API key not configured' }, { status: 500 });
  }

  try {
    const body = (await request.json()) as unknown;
    const validatedData = notificationEmailSchema.parse(body: unknown);

    const emailData: NotificationEmailRequest = {
      to: validatedData.to,
      subject: validatedData.subject,
      title: validatedData.title,
      message: validatedData.message,
      recipientName: validatedData.recipientName,
      actionUrl: validatedData.actionUrl,
      actionText: validatedData.actionText,
    };

    await sendNotificationEmail(emailData: unknown);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    logger.error('Failed to send email', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      ) as NextResponse;
    }

    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 }) as NextResponse;
  }
}
