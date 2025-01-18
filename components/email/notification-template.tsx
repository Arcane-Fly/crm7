import * as React from 'react'
import './notification-template.css'

interface NotificationTemplateProps {
  title: string
  message: string
  actionUrl?: string
  actionText?: string
  recipientName: string
}

export const NotificationTemplate: React.FC<Readonly<NotificationTemplateProps>> = ({
  title,
  message,
  actionUrl,
  actionText,
  recipientName,
}) => (
  <div className='email-container'>
    <h1 className='email-heading'>{title}</h1>
    <p className='email-text'>Dear {recipientName},</p>
    <p className='email-text'>{message}</p>
    {actionUrl && actionText && (
      <a href={actionUrl} className='email-button'>
        {actionText}
      </a>
    )}
    <p className='email-footer'>
      Best regards,
      <br />
      The CRM7R Team
    </p>
  </div>
)

// Styles
// const container = {
//   margin: '0 auto',
//   padding: '20px',
//   fontFamily:
//     '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
// }

// const h1 = {
//   color: '#1a1a1a',
//   fontSize: '24px',
//   fontWeight: '600',
//   lineHeight: '32px',
//   margin: '0 0 20px',
// }

// const text = {
//   color: '#4a4a4a',
//   fontSize: '16px',
//   lineHeight: '24px',
//   margin: '0 0 16px',
// }

// const button = {
//   backgroundColor: '#0070f3',
//   borderRadius: '5px',
//   color: '#fff',
//   display: 'inline-block',
//   fontSize: '16px',
//   fontWeight: '600',
//   padding: '12px 24px',
//   textDecoration: 'none',
//   margin: '0 0 16px',
// }

// const footer = {
//   color: '#6b7280',
//   fontSize: '14px',
//   lineHeight: '24px',
//   margin: '48px 0 0',
// }
