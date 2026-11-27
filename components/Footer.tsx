import Link from 'next/link'

export function Footer() {
  return (
    <footer className="w-full mt-auto border-t border-white/10 bg-[#050806]/60 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-white/50">
        <div>
          <p className="font-medium text-white/80">
            Made for VVCE students
          </p>
          <p className="text-[11px] text-white/40 mt-0.5">
            CalciShare only connects VVCE students. All handoffs, payments, and item conditions are solely between the two parties—the developers assume no responsibility.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/privacy"
            className="text-white/60 hover:text-brand-green transition-colors duration-300"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
