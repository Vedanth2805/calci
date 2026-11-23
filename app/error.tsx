'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RotateCcw, Home, Calculator } from 'lucide-react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('[CalciShare Error Boundary]:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Top Bar */}
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
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>
      </header>

      {/* Main Error Box */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-md mx-auto">
        <div className="w-16 h-16 mb-5 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-800 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-2">
          Oops, something went wrong
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Temporary Connection Error
        </h1>

        <p className="mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          We encountered an unexpected issue while loading data. This could be due to a brief network hiccup with Supabase.
        </p>

        {error?.digest && (
          <p className="mt-2 text-[11px] font-mono text-zinc-400">
            Error Ref: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </main>

      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 py-6 px-4 text-center text-xs text-zinc-500 dark:text-zinc-400 bg-white/50 dark:bg-zinc-900/50 mt-auto">
        <p>CalciShare — Vidyavardhaka College of Engineering, Mysuru</p>
      </footer>
    </div>
  )
}
