import React from 'react';
import { renderToString } from 'react-dom/server';
import nodemailer from 'nodemailer';
import { NotificationTemplate } from '@/components/email/notification-template';
import { env } from '@/lib/config/environment';
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

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendNotificationEmail(emailData: NotificationEmailRequest): Promise<void> {
  try {
    const emailContent = React.createElement(NotificationTemplate, {
      title: emailData.title,
      message: emailData.message,
      recipientName: emailData.recipientName,
      actionUrl: emailData.actionUrl,
      actionText: emailData.actionText,
    });

    const html = renderToString(emailContent);

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: emailData.to,
      subject: emailData.subject,
      html,
    });
  } catch (error) {
    logger.error('Failed to send notification email:', error);
    throw error;
  }
}
