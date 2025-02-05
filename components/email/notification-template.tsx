import './notification-template.css';
import { type NotificationTemplateProps } from '@/lib/types';

interface NotificationTemplateProps {
  title: string;
  message: string;
  recipientName: string;
  actionUrl?: string;
  actionText?: string;
}

export function NotificationTemplate({
  title,
  message,
  recipientName,
  actionUrl,
  actionText,
}: NotificationTemplateProps): React.ReactElement {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
      </head>
      <body>
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">${title}</h1>
          <p>Hello ${recipientName},</p>
          <p>${message}</p>
          ${actionUrl && actionText ? `
            <p>
              <a href="${actionUrl}" style="background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                ${actionText}
              </a>
            </p>
          ` : ''}
          <p>Best regards,<br>Your Team</p>
        </div>
      </body>
    </html>
  `;
}
