import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'
import { Footer } from '@/components/Footer'
import {
  Calculator,
  ShieldCheck,
  ArrowRightLeft,
  MessageCircle,
  AlertCircle,
  Lock,
  Clock,
  Shield,
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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/board')
  }

  const resolvedSearchParams = await searchParams
  const error = resolvedSearchParams?.error
  const details = resolvedSearchParams?.details
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  )

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Top Banner / Nav */}
      <header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/25">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg leading-tight tracking-tight block">
                CalciShare
              </span>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase block">
                VVCE Student Network
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/privacy"
              className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              VVCE Exclusive
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-12 md:py-16">
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center">
          {!isConfigured && (
            <div className="w-full mb-8 p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-left flex items-start gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="font-semibold text-sm">Supabase Configuration Required</h2>
                <p className="text-xs sm:text-sm mt-0.5 text-amber-800 dark:text-amber-300">
                  Please copy <span className="font-mono">.env.example</span> to{' '}
                  <span className="font-mono font-bold">.env.local</span> and fill in your{' '}
                  <span className="font-mono">NEXT_PUBLIC_SUPABASE_URL</span> and{' '}
                  <span className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>.
                </p>
              </div>
            </div>
          )}

          {/* Error Message Banners */}
          {error === 'wrong_domain' && (
            <div className="w-full mb-8 p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-left flex items-start gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="font-semibold text-sm">Access Restricted to VVCE Accounts</h2>
                <p className="text-xs sm:text-sm mt-0.5 text-amber-800 dark:text-amber-300">
                  Only email addresses ending with{' '}
                  <span className="font-mono font-bold">@vvce.ac.in</span> can access CalciShare.
                  Please sign in using your official VVCE college Google account (e.g.{' '}
                  <span className="font-mono">vvce24cse463@vvce.ac.in</span>).
                </p>
              </div>
            </div>
          )}

          {error === 'auth_error' && (
            <div className="w-full mb-8 p-4 rounded-xl bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-800/80 text-red-900 dark:text-red-200 text-left flex items-start gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="w-full">
                <h2 className="font-semibold text-sm">Authentication Failed</h2>
                <p className="text-xs sm:text-sm mt-0.5 text-red-800 dark:text-red-300">
                  We could not complete your sign in. Please try again with your VVCE Google account.
                </p>
                {details && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-red-100 dark:bg-red-900/50 text-xs font-mono text-red-950 dark:text-red-100 break-all border border-red-200 dark:border-red-800">
                    <span className="font-bold">Error message:</span> {details}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hero Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/70 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Peer-to-Peer Scientific Calculator Exchange
          </div>

          {/* Hero Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
            Lend or sell scientific calculators between{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              VVCE juniors & seniors
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="mt-4 text-sm sm:text-base md:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Need an fx-991CW or fx-991EX for your semester exams or lab sessions? Finished your
            engineering math cycles? CalciShare connects Vidyavardhaka College of Engineering
            (VVCE) students directly to lend or sell calculators quickly and safely on campus.
          </p>

          {/* CTA Box */}
          <div className="mt-8 w-full max-w-md p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              Sign in with your College ID
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
              Instant login restricted strictly to <span className="font-medium">@vvce.ac.in</span>{' '}
              Google accounts.
            </p>
            <GoogleSignInButton />
          </div>

          {/* Google Review & Privacy Transparency Card */}
          <div className="mt-8 w-full max-w-2xl p-4 sm:p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 text-left text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm mb-2">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>How CalciShare Uses Your Data</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-xs">
              When you sign in with your official Google account, CalciShare accesses only your{' '}
              <strong>@vvce.ac.in email address</strong> to verify that you are a VVCE student and to
              derive your academic branch and year (e.g. CSE &apos;24). Your email address is{' '}
              <strong>never shown publicly</strong> to other students. Listing details and contact handles
              are visible only to logged-in VVCE peers, and you can delete your posts anytime.
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs">
              <Link
                href="/privacy"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Read our complete Privacy Policy</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-12 w-full grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                VVCE Verified Only
              </h3>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-normal">
                Enforced at the database level. Only verified VVCE students can log in, post, or view
                contact info.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                Lend or Sell
              </h3>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-normal">
                Choose to lend for free or sell at student-friendly prices. No hidden fees or middleman cuts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3">
                <MessageCircle className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                Direct Contact
              </h3>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-normal">
                Connect via Instagram or Discord to coordinate handoffs right outside the library or canteen.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
