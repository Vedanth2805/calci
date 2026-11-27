import type { Metadata } from 'next'
import Link from 'next/link'
import { Calculator, ArrowLeft, Home, Search } from 'lucide-react'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: '404 - Page Not Found | CalciShare',
  description: 'The requested page or calculator could not be found on CalciShare.',
}

export default function NotFound() {
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
            <span>Home</span>
          </Link>
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center max-w-md mx-auto">
        <div className="w-16 h-16 mb-6 rounded-2xl bg-brand-green/10 border border-brand-green/30 text-brand-green flex items-center justify-center shadow-[0_0_25px_rgba(214,248,102,0.15)]">
          <Calculator className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono uppercase tracking-[0.2em] text-brand-green mb-2">
          Error 404
        </span>

        <h1 className="text-3xl sm:text-4xl font-medium text-white tracking-tight leading-[1.05]">
          Page Not Found
        </h1>

        <p className="mt-3 text-xs sm:text-sm text-white/60 leading-relaxed font-light">
          Looks like this calculator listing or page doesn&apos;t exist, was moved, or has expired.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/board"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-brand-green text-black shadow-[0_0_20px_rgba(214,248,102,0.2)] hover:shadow-[0_0_28px_rgba(214,248,102,0.4)] transition-all duration-300"
          >
            <Search className="w-4 h-4" />
            <span>Browse Calculators</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all duration-300"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
