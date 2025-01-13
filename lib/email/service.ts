import { Resend } from 'resend'
import { NotificationTemplate } from '@/components/email/notification-template'

const resend = new Resend(process.env.RESEND_API_KEY)

export type NotificationEmailParams = {
  to: string | string[]
  subject: string
  title: string
  message: string
  recipientName: string
  actionUrl?: string
  actionText?: string
}

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
    const { data, error } = await resend.emails.send({
      from: 'CRM7R <notifications@crm7r.com>',
      to,
      subject,
      react: NotificationTemplate({
        title,
        message,
        recipientName,
        actionUrl,
        actionText,
      }),
    })

    if (error) {
      console.error('Failed to send email:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}
