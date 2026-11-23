import Link from 'next/link'

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 py-6 px-4 text-xs text-zinc-500 dark:text-zinc-400 bg-white/50 dark:bg-zinc-900/50 mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <p className="font-medium text-zinc-700 dark:text-zinc-300">
            Made by a VVCE student
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            CalciShare — Peer calculator exchange for Vidyavardhaka College of Engineering, Mysuru
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/privacy"
            className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <a
            href="mailto:support@YOUR_DOMAIN"
            className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors font-mono text-[11px]"
          >
            support@YOUR_DOMAIN
          </a>
        </div>
      </div>
    </footer>
  )
}
