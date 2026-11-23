import type { Metadata } from 'next'
import Link from 'next/link'
import { Calculator, ArrowLeft, Shield, Clock, Eye, Trash2, Mail, Lock } from 'lucide-react'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy | CalciShare',
  description:
    'Privacy Policy for CalciShare — A peer-to-peer scientific calculator exchange for VVCE students. Learn how your data is handled and protected.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Top Header */}
      <header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Calculator className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base leading-tight">CalciShare</span>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                VVCE Student Network
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Title Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-semibold mb-3">
          <Shield className="w-3.5 h-3.5" />
          <span>CalciShare Student Privacy</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Last updated: November 2026 • Plain language policy for Vidyavardhaka College of Engineering (VVCE) students
        </p>

        <div className="mt-8 space-y-8 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {/* Section 1 */}
          <section className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2.5 text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base">
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Calculator className="w-4 h-4" />
              </div>
              <h2>About CalciShare</h2>
            </div>
            <p>
              CalciShare is an independent peer-to-peer web platform created exclusively for students of{' '}
              <strong>Vidyavardhaka College of Engineering (VVCE), Mysuru</strong>. The platform allows juniors and seniors to lend or sell unused scientific calculators (such as Casio fx-991CW, fx-991EX, fx-82MS) directly to batchmates on campus.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2.5 text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base">
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Lock className="w-4 h-4" />
              </div>
              <h2>Information We Collect</h2>
            </div>
            <p className="mb-3">
              We practice data minimization and collect only the essential details required to operate a verified student exchange:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:text-zinc-400 pl-1">
              <li>
                <strong>Official College Email:</strong> When you sign in via Google OAuth, we receive your <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200">@vvce.ac.in</code> email address. This is used strictly to verify that you are a student and to automatically derive your admission year and academic branch (e.g. CSE &apos;24). <em>Your email address is NEVER shown publicly to other students.</em>
              </li>
              <li>
                <strong>Listing Information:</strong> When you post a calculator, we store the calculator model, whether you wish to lend or sell, the price (for sales only), and any optional note you include.
              </li>
              <li>
                <strong>Contact Handle:</strong> You provide an Instagram username or Discord handle so interested peers can reach out directly.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2.5 text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base">
              <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
                <Eye className="w-4 h-4" />
              </div>
              <h2>Who Can See Your Information</h2>
            </div>
            <p>
              Access to listings and contact handles is strictly restricted. Only logged-in students with a verified <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200">@vvce.ac.in</code> account can view active listings and contact handles. Anonymous or logged-out visitors cannot view listings, student handles, or any contact details.
            </p>
          </section>

          {/* Section 4 */}
          <section className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2.5 text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base">
              <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <h2>Listing Expiration & User Control</h2>
            </div>
            <p className="mb-2">
              You retain total control over the listings you publish:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-600 dark:text-zinc-400 pl-1">
              <li>Listings automatically expire after <strong>30 days</strong> to prevent stale posts.</li>
              <li>You can mark a listing as completed (&quot;Done&quot;) at any time once handed over.</li>
              <li>You can permanently delete any of your listings instantly from the <strong>My listings</strong> page.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2.5 text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base">
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Shield className="w-4 h-4" />
              </div>
              <h2>Data Storage & No Third-Party Selling</h2>
            </div>
            <p>
              We do <strong>NOT</strong> sell, rent, monetize, or disclose your personal data to advertisers or third-party marketers. Your data is stored securely in <strong>Supabase</strong> (PostgreSQL) hosted in secure cloud infrastructure with database-level Row Level Security (RLS) enforcement.
            </p>
          </section>

          {/* Section 6 */}
          <section className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2.5 text-zinc-900 dark:text-zinc-100 font-bold text-sm sm:text-base">
              <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                <Trash2 className="w-4 h-4" />
              </div>
              <h2>Account Deletion & Data Inquiries</h2>
            </div>
            <p>
              If you wish to have your profile and all associated listings permanently deleted from our database, or have any questions about this Privacy Policy, please send an email to:
            </p>
            <div className="mt-3 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 font-mono text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-zinc-500" />
              <a href="mailto:privacy@YOUR_DOMAIN" className="hover:underline">
                privacy@YOUR_DOMAIN
              </a>
            </div>
            <p className="mt-2 text-[11px] text-zinc-500">
              Please send the request from your official VVCE email address so we can confirm ownership and process your deletion within 48 hours.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
