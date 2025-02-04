import nodemailer from 'nodemailer';
import { NotificationTemplate } from '@/components/email/notification-template';
import { env } from '@/lib/config/environment';
import { logger } from '@/lib/services/logger';

interface NotificationEmailRequest {
  to: string;
  subject: string;
  title: string;
  message: string;
  recipientName: string;
  actionUrl?: string;
  actionText?: string;
}

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: true,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function sendNotificationEmail(emailData: NotificationEmailRequest): Promise<void> {
  try {
    const emailContent = await NotificationTemplate({
      title: emailData.title,
      message: emailData.message,
      recipientName: emailData.recipientName,
      actionUrl: emailData.actionUrl,
      actionText: emailData.actionText,
    });

    const mailOptions = {
      from: env.SMTP_FROM,
      to: emailData.to,
      subject: emailData.subject,
      html: emailContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    logger.error('Failed to send notification email:', error);
    throw error;
  }
}
