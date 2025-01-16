import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.delete({
            name,
            ...options,
          })
        },
      },
    }
  )

  // Check auth status
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect all routes except auth and public ones
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isPublicPage = ['/_next', '/images', '/api/public', '/favicon.ico'].some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (!session && !isAuthPage && !isPublicPage) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}
