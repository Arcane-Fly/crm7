import './notification-template.css';

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
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>{title}</title>
      </head>
      <body>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <h1 style={{ color: '#333' }}>{title}</h1>
          <p>Hello {recipientName},</p>
          <p>{message}</p>
          {actionUrl && actionText && (
            <p>
              <a
                href={actionUrl}
                style={{
                  backgroundColor: '#007bff',
                  color: '#ffffff',
                  padding: '10px 20px',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  display: 'inline-block',
                }}
              >
                {actionText}
              </a>
            </p>
          )}
          <p>
            Best regards,
            <br />
            Your Team
          </p>
        </div>
      </body>
    </html>
  );
}
