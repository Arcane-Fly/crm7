import { type NextRequest } from 'next/server'
import { sendNotificationEmail } from '@/lib/email/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, title, message, recipientName, actionUrl, actionText } = body

    const data = await sendNotificationEmail({
      to,
      subject,
      title,
      message,
      recipientName,
      actionUrl,
      actionText,
    })

    return Response.json(data)
  } catch (error) {
    console.error('API error:', error)
    return Response.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
