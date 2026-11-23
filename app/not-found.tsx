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
            <span>Home</span>
          </Link>
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-md mx-auto">
        <div className="w-16 h-16 mb-5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800 shadow-sm">
          <Calculator className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
          Error 404
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Page Not Found
        </h1>

        <p className="mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Looks like this calculator listing or page doesn&apos;t exist, was moved, or has expired.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/board"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Browse Calculators</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
