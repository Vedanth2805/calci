import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.delete('x-user-id')
  requestHeaders.delete('x-user-email')

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // IMPORTANT: Avoid running code between createServerClient and supabase.auth.getUser().
  // Always use getUser() to validate the JWT against the Supabase Auth server.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    requestHeaders.set('x-user-id', user.id)
    if (user.email) {
      requestHeaders.set('x-user-email', user.email)
    }
    const existingCookies = supabaseResponse.cookies.getAll()
    supabaseResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
    existingCookies.forEach((cookie) => {
      supabaseResponse.cookies.set(cookie)
    })
  }

  const { pathname } = request.nextUrl

  // Protected routes: redirect unauthenticated users away from /board, /post, /my-listings to "/"
  const protectedRoutes = ['/board', '/post', '/my-listings']
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
