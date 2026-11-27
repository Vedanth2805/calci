import type { Metadata } from 'next'
import Link from 'next/link'
import { getVerifiedUser } from '@/utils/supabase/auth'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'
import { Footer } from '@/components/Footer'
import {
  Calculator,
  ArrowRight,
  ArrowRightLeft,
  AlertCircle,
  Lock,
  CheckCircle2,
  Shield,
  MessageCircle,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'CalciShare | Peer Calculator Exchange for VVCE Students',
  description:
    'Lend or sell scientific calculators between VVCE juniors and seniors. Official Google login strictly for @vvce.ac.in accounts.',
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const user = await getVerifiedUser()

  const resolvedSearchParams = await searchParams
  const error = resolvedSearchParams?.error
  const details = resolvedSearchParams?.details
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  )

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* SECTION 1 - NAVIGATION */}
      <header className="sticky top-6 z-20 w-full max-w-4xl mx-auto px-4">
        <nav className="rounded-full backdrop-blur-md bg-white/5 border border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          {/* Logo left */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-brand-green/15 border border-brand-green/30 flex items-center justify-center text-brand-green transition-transform duration-300 group-hover:scale-105">
              <Calculator className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm sm:text-base tracking-tight text-white">
              CalciShare
            </span>
          </Link>

          {/* Links center */}
          <div className="hidden md:flex items-center gap-7 text-xs font-medium text-white/60">
            <a
              href="#how-it-works"
              className="transition-colors duration-300 hover:text-white"
            >
              How it works
            </a>
            <Link
              href="/privacy"
              className="transition-colors duration-300 hover:text-white"
            >
              Privacy
            </Link>
          </div>

          {/* Actions right */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/post"
                  className="hidden sm:inline-block text-xs font-medium text-white/70 hover:text-white transition-colors duration-300"
                >
                  Post
                </Link>
                <Link
                  href="/board"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-brand-green text-black text-xs font-medium shadow-[0_0_20px_rgba(214,248,102,0.2)] hover:shadow-[0_0_28px_rgba(214,248,102,0.4)] hover:brightness-105 transition-all duration-300"
                >
                  <span>Go to Board</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <>
                <a
                  href="#signin"
                  className="hidden sm:inline-block text-xs font-medium text-white/70 hover:text-white transition-colors duration-300"
                >
                  Log in
                </a>
                <GoogleSignInButton compact label="Get Started" />
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="w-full flex-1 flex flex-col items-center px-4 sm:px-6">
        {/* Error & Configuration Banners */}
        {(!isConfigured || error === 'wrong_domain' || error === 'auth_error') && (
          <div className="w-full max-w-3xl mx-auto mt-10 space-y-4">
            {!isConfigured && (
              <div className="w-full p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 backdrop-blur-md text-amber-200 text-left flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h2 className="font-semibold text-sm">Supabase Configuration Required</h2>
                  <p className="text-xs sm:text-sm mt-0.5 text-amber-200/80">
                    Please copy <span className="font-mono">.env.example</span> to{' '}
                    <span className="font-mono font-bold">.env.local</span> and fill in your{' '}
                    <span className="font-mono">NEXT_PUBLIC_SUPABASE_URL</span> and{' '}
                    <span className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>.
                  </p>
                </div>
              </div>
            )}

            {error === 'wrong_domain' && (
              <div className="w-full p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 backdrop-blur-md text-amber-200 text-left flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h2 className="font-semibold text-sm">Access Restricted to VVCE Accounts</h2>
                  <p className="text-xs sm:text-sm mt-0.5 text-amber-200/80">
                    Only email addresses ending with{' '}
                    <span className="font-mono font-bold text-white">@vvce.ac.in</span> can access
                    CalciShare. Please sign in using your official VVCE college Google account (e.g.{' '}
                    <span className="font-mono">vvce24cse463@vvce.ac.in</span>).
                  </p>
                </div>
              </div>
            )}

            {error === 'auth_error' && (
              <div className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-400/30 backdrop-blur-md text-red-200 text-left flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="w-full">
                  <h2 className="font-semibold text-sm">Authentication Failed</h2>
                  <p className="text-xs sm:text-sm mt-0.5 text-red-200/80">
                    We could not complete your sign in. Please try again with your VVCE Google account.
                  </p>
                  {details && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-red-950/60 text-xs font-mono text-red-100 break-all border border-red-400/20">
                      <span className="font-bold">Error message:</span> {details}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2 - HERO */}
        <section className="w-full max-w-4xl mx-auto pt-14 sm:pt-20 pb-12 sm:pb-16 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs text-white/80 mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-green shadow-[0_0_10px_#D6F866]" />
            <span className="text-brand-green font-medium">VVCE Exclusive</span>
            <span className="text-white/30">|</span>
            <span>Campus Calculator Exchange</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-white leading-[1.08] max-w-3xl">
            Borrow or buy a{' '}
            <span className="font-serif italic text-brand-green font-normal">calculator</span>{' '}
            on campus.
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base text-white/65 max-w-xl leading-relaxed font-light">
            Need an fx-991CW or fx-991EX for internals or lab sessions, or want a cheap used one
            from a senior? Connect directly with verified VVCE students—no middleman fees.
          </p>

          {/* CTA */}
          <div id="signin" className="mt-8 flex flex-col items-center gap-3 w-full">
            {user ? (
              <>
                <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                  <Link
                    href="/board"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full font-medium text-sm text-black bg-brand-green shadow-[0_0_20px_rgba(214,248,102,0.2)] hover:shadow-[0_0_32px_rgba(214,248,102,0.4)] hover:brightness-105 transition-all duration-300 group"
                  >
                    <span>Open Calculator Board</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/post"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-medium text-sm text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
                  >
                    <span>Post a Calculator</span>
                  </Link>
                </div>
                <p className="text-xs text-white/45">
                  Signed in as <span className="font-mono text-white/75">{user.email}</span>
                </p>
              </>
            ) : (
              <>
                <GoogleSignInButton />
                <p className="text-xs text-white/45">
                  Restricted strictly to{' '}
                  <span className="font-mono text-white/75">@vvce.ac.in</span> Google accounts.
                </p>
              </>
            )}
          </div>

          {/* Trust row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-white/55">
            <div className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-green/70" />
              <span>@vvce.ac.in verified</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-green/70" />
              <span>Zero middleman fees</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-green/70" />
              <span>Direct campus handoff</span>
            </div>
          </div>
        </section>

        {/* SECTION 3 - HOW IT WORKS */}
        <section id="how-it-works" className="w-full max-w-5xl mx-auto py-10 sm:py-14">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-green font-medium mb-2">
              How it works
            </p>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">
              Ready in under a minute
            </h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Horizontal connecting gradient line (hidden on mobile) */}
            <div className="hidden md:block absolute top-7 left-[16%] right-[16%] h-px bg-gradient-to-r from-white/10 via-brand-green/40 to-white/10 pointer-events-none" />

            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-[#111612] border border-white/10 flex items-center justify-center text-white/80 mb-4 relative z-10">
                <Lock className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-white/40 mb-1">01</span>
              <h3 className="text-base font-medium text-white mb-1.5">Verify College ID</h3>
              <p className="text-sm text-white/55 font-light leading-relaxed">
                Sign in with your <span className="font-mono text-xs">@vvce.ac.in</span> Google
                account. Only verified VVCE students can see your posts.
              </p>
            </div>

            {/* Step 2 (Highlighted) */}
            <div className="relative flex flex-col items-center text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-green/10 border border-brand-green/40 flex items-center justify-center text-brand-green mb-4 relative z-10 shadow-[0_0_25px_rgba(214,248,102,0.15)]">
                <ArrowRightLeft className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand-green shadow-[0_0_10px_#D6F866]" />
              </div>
              <span className="text-[11px] font-mono text-brand-green mb-1">02</span>
              <h3 className="text-base font-medium text-white mb-1.5">Browse or Post</h3>
              <p className="text-sm text-white/55 font-light leading-relaxed">
                Filter live listings by model (fx-991CW, fx-991EX) or post your spare calculator in
                30 seconds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-[#111612] border border-white/10 flex items-center justify-center text-white/80 mb-4 relative z-10">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-white/40 mb-1">03</span>
              <h3 className="text-base font-medium text-white mb-1.5">Meet &amp; Handoff</h3>
              <p className="text-sm text-white/55 font-light leading-relaxed">
                Message your batchmate directly and exchange near the library, canteen, or block.
              </p>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-brand-green transition-colors duration-300 underline underline-offset-4 decoration-white/20"
            >
              <Shield className="w-3.5 h-3.5 text-brand-green" />
              <span>Read how CalciShare protects your data</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
