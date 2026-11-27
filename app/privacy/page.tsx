import type { Metadata } from 'next'
import Link from 'next/link'
import { Calculator, ArrowLeft, Shield, Clock, Eye, Trash2, Lock } from 'lucide-react'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy | CalciShare',
  description:
    'Privacy Policy for CalciShare — A peer-to-peer scientific calculator exchange for VVCE students. Learn how your data is handled and protected.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header */}
      <header className="sticky top-6 z-20 w-full max-w-4xl mx-auto px-4">
        <div className="rounded-full backdrop-blur-md bg-white/5 border border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-brand-green/15 border border-brand-green/30 flex items-center justify-center text-brand-green group-hover:scale-105 transition-transform duration-300">
              <Calculator className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm sm:text-base leading-tight text-white">
                CalciShare
              </span>
              <span className="text-[10px] font-medium text-brand-green/80 uppercase tracking-wider">
                VVCE Student Network
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 hover:text-white transition-all duration-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-16 sm:py-20">
        {/* Title Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-green text-xs font-medium mb-4">
          <Shield className="w-3.5 h-3.5" />
          <span>CalciShare Student Privacy</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white leading-[1.05]">
          Privacy <span className="font-serif italic text-brand-green font-normal">Policy</span>
        </h1>
        <p className="mt-3 text-xs sm:text-sm text-white/50">
          Last updated: November 2026 • Plain language policy for Vidyavardhaka College of Engineering (VVCE) students
        </p>

        <div className="mt-10 space-y-6 text-xs sm:text-sm text-white/70 leading-relaxed font-light">
          {/* Section 1 */}
          <section className="p-6 rounded-3xl bg-[#111612]/60 backdrop-blur-xl border border-white/10">
            <div className="flex items-center gap-3 mb-3 text-white font-medium text-sm sm:text-base">
              <div className="p-2 rounded-xl bg-brand-green/10 border border-brand-green/20 text-brand-green">
                <Calculator className="w-4 h-4" />
              </div>
              <h2>About CalciShare</h2>
            </div>
            <p>
              CalciShare is an independent peer-to-peer web platform created exclusively for students of{' '}
              <strong className="text-white font-medium">Vidyavardhaka College of Engineering (VVCE), Mysuru</strong>. The platform allows juniors and seniors to lend or sell unused scientific calculators (such as Casio fx-991CW, fx-991EX, fx-82MS) directly to batchmates on campus.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 rounded-3xl bg-[#111612]/60 backdrop-blur-xl border border-white/10">
            <div className="flex items-center gap-3 mb-3 text-white font-medium text-sm sm:text-base">
              <div className="p-2 rounded-xl bg-brand-green/10 border border-brand-green/20 text-brand-green">
                <Lock className="w-4 h-4" />
              </div>
              <h2>Information We Collect</h2>
            </div>
            <p className="mb-3">
              We practice data minimization and collect only the essential details required to operate a verified student exchange:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/60 pl-1">
              <li>
                <strong className="text-white font-medium">Official College Email:</strong> When you sign in via Google OAuth, we receive your <code className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-brand-green">@vvce.ac.in</code> email address to verify student status, derive your branch/year, and attach it automatically to listings you post to prevent fake posts. <em className="text-white/80">Your email is NEVER shown to the public or logged-out visitors—only logged-in VVCE students can see it on your listings.</em>
              </li>
              <li>
                <strong className="text-white font-medium">Listing Information:</strong> When you post a calculator, we store the calculator model, whether you wish to lend or sell, the price (for sales only), and any optional note you include.
              </li>
              <li>
                <strong className="text-white font-medium">Contact Handle:</strong> You provide an Instagram username or Discord handle so interested peers can reach out directly.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="p-6 rounded-3xl bg-[#111612]/60 backdrop-blur-xl border border-white/10">
            <div className="flex items-center gap-3 mb-3 text-white font-medium text-sm sm:text-base">
              <div className="p-2 rounded-xl bg-brand-green/10 border border-brand-green/20 text-brand-green">
                <Eye className="w-4 h-4" />
              </div>
              <h2>Who Can See Your Information</h2>
            </div>
            <p>
              Access to listings and contact handles is strictly restricted. Only logged-in students with a verified <code className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-brand-green">@vvce.ac.in</code> account can view active listings and contact handles. Anonymous or logged-out visitors cannot view listings, student handles, or any contact details.
            </p>
          </section>

          {/* Section 4 */}
          <section className="p-6 rounded-3xl bg-[#111612]/60 backdrop-blur-xl border border-white/10">
            <div className="flex items-center gap-3 mb-3 text-white font-medium text-sm sm:text-base">
              <div className="p-2 rounded-xl bg-brand-green/10 border border-brand-green/20 text-brand-green">
                <Clock className="w-4 h-4" />
              </div>
              <h2>Listing Expiration &amp; User Control</h2>
            </div>
            <p className="mb-2">
              You retain total control over the listings you publish:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-white/60 pl-1">
              <li>Listings automatically expire after <strong className="text-white font-medium">30 days</strong> to prevent stale posts.</li>
              <li>You can mark a listing as completed (&quot;Done&quot;) at any time once handed over.</li>
              <li>You can permanently delete any of your listings instantly from the <strong className="text-white font-medium">My listings</strong> page.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="p-6 rounded-3xl bg-[#111612]/60 backdrop-blur-xl border border-white/10">
            <div className="flex items-center gap-3 mb-3 text-white font-medium text-sm sm:text-base">
              <div className="p-2 rounded-xl bg-brand-green/10 border border-brand-green/20 text-brand-green">
                <Shield className="w-4 h-4" />
              </div>
              <h2>Data Storage &amp; No Third-Party Selling</h2>
            </div>
            <p>
              We do <strong className="text-white font-medium">NOT</strong> sell, rent, monetize, or disclose your personal data to advertisers or third-party marketers. Your data is stored securely in <strong className="text-white font-medium">Supabase</strong> (PostgreSQL) hosted in secure cloud infrastructure with database-level Row Level Security (RLS) enforcement.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-6 rounded-3xl bg-[#111612]/60 backdrop-blur-xl border border-white/10">
            <div className="flex items-center gap-3 mb-3 text-white font-medium text-sm sm:text-base">
              <div className="p-2 rounded-xl bg-brand-green/10 border border-brand-green/20 text-brand-green">
                <Shield className="w-4 h-4" />
              </div>
              <h2>Peer-to-Peer Terms &amp; No Liability</h2>
            </div>
            <p>
              CalciShare is strictly a campus directory that connects verified VVCE students who want to lend, sell, or request calculators. We do <strong className="text-white font-medium">not</strong> inspect calculators, verify working condition, handle payments or deposits, or mediate disputes.
            </p>
            <p className="mt-2.5 text-white/60">
              All handoffs, payments, ID checks, and calculator returns happen solely between the two students. Buyers should always test all buttons, the LCD display, and the solar panel in person before paying, and lenders are encouraged to take a photo of the borrower&apos;s college ID card and note their phone number. The CalciShare developers assume no responsibility for lost, damaged, or defective items.
            </p>
          </section>

          {/* Section 6 */}
          <section className="p-6 rounded-3xl bg-[#111612]/60 backdrop-blur-xl border border-white/10">
            <div className="flex items-center gap-3 mb-3 text-white font-medium text-sm sm:text-base">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-400/20 text-red-400">
                <Trash2 className="w-4 h-4" />
              </div>
              <h2>Account Deletion &amp; Data Control</h2>
            </div>
            <p>
              You can permanently delete any of your active or past calculator listings at any time from the{' '}
              <strong className="text-white font-medium">My listings</strong> page—deleted listings are removed immediately from the database.
            </p>
            <p className="mt-2.5 text-white/60">
              If you want your entire profile record removed as well, please sign out and stop using the service, or contact the VVCE student maintainer directly on campus.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
