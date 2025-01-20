import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    
    // Verify webhook signature
    const signature = request.headers.get('x-vercel-signature')
    if (!signature) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Log deployment status
    console.log('Deployment Status:', {
      id: payload.id,
      name: payload.name,
      url: payload.url,
      state: payload.state,
      createdAt: payload.createdAt
    })

    // Here you can add your own notification logic
    // e.g., send to Slack, Discord, or email

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('Webhook Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
