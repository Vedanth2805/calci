import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * Validates that a redirect target is strictly an internal, relative path.
 * Disallows protocol-relative URLs (e.g. //evil.com, /\evil.com) and absolute URLs.
 */
function getSafeInternalRedirect(rawNext: string | null): string {
  if (!rawNext) return '/board'

  // Must begin with a single leading slash and not / or \
  if (!rawNext.startsWith('/') || rawNext.startsWith('//') || rawNext.startsWith('/\\')) {
    return '/board'
  }

  try {
    const dummyOrigin = 'http://localhost'
    const parsed = new URL(rawNext, dummyOrigin)
    // Confirm parsed origin matches dummyOrigin (no protocol/host spoofing)
    if (parsed.origin !== dummyOrigin) {
      return '/board'
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return '/board'
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const rawNext = requestUrl.searchParams.get('next')
  const next = getSafeInternalRedirect(rawNext)
  const errorParam = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Check if provider returned an error directly
  if (errorParam || errorDescription) {
    console.error('[Auth Callback] Provider error:', { errorParam, errorDescription })
    const combinedError = `${errorParam || ''}: ${errorDescription || ''}`.toLowerCase()
    const isDomainError =
      combinedError.includes('vvce.ac.in') ||
      combinedError.includes('saving new user')

    const redirectUrl = new URL(requestUrl.origin)
    redirectUrl.pathname = '/'
    redirectUrl.searchParams.set('error', isDomainError ? 'wrong_domain' : 'auth_error')
    if (errorDescription || errorParam) {
      redirectUrl.searchParams.set(
        'details',
        errorDescription || errorParam || 'OAuth provider returned an error'
      )
    }
    return NextResponse.redirect(redirectUrl)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('[Auth Callback] Exchange code error:', exchangeError.message, exchangeError)
      const message = exchangeError.message.toLowerCase()
      const isDomainError =
        message.includes('vvce.ac.in') ||
        message.includes('saving new user')

      const redirectUrl = new URL(requestUrl.origin)
      redirectUrl.pathname = '/'
      redirectUrl.searchParams.set('error', isDomainError ? 'wrong_domain' : 'auth_error')
      redirectUrl.searchParams.set('details', exchangeError.message)
      return NextResponse.redirect(redirectUrl)
    }

    // Domain validation safeguard on the session user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user?.email && !user.email.toLowerCase().endsWith('@vvce.ac.in')) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/?error=wrong_domain', requestUrl.origin))
    }

    // Authentication succeeded - redirect strictly to safe internal path
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  }

  // No code present
  const redirectUrl = new URL(requestUrl.origin)
  redirectUrl.pathname = '/'
  redirectUrl.searchParams.set('error', 'auth_error')
  redirectUrl.searchParams.set('details', 'No authentication code was returned from Google.')
  return NextResponse.redirect(redirectUrl)
}
