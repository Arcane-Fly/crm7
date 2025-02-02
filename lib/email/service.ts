import React from 'react';
import { Resend } from 'resend';

import { NotificationTemplate } from '@/components/email/notification-template';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is not set');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export type NotificationEmailParams = {
  to: string | string[];
  subject: string;
  title: string;
  message: string;
  recipientName: string;
  actionUrl?: string;
  actionText?: string;
};

export async function sendNotificationEmail({
  to,
  subject,
  title,
  message,
  recipientName,
  actionUrl,
  actionText,
}: NotificationEmailParams) {
  try {
    // Create the React element before sending
    const emailContent = React.createElement(NotificationTemplate: unknown, {
      title,
      message,
      recipientName,
      actionUrl,
      actionText,
    });

    const { data, error } = await resend.emails.send({
      from: 'CRM7R <notifications@crm7r.com>',
      to,
      subject,
      react: emailContent,
    });

    if (error: unknown) {
      console.error('Failed to send email:', error);
      throw error;
    }

    return data;
  } catch (error: unknown) {
    console.error('Error sending email:', error);
    throw error;
  }
}
