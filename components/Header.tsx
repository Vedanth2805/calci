'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calculator, PlusCircle, ListOrdered, LayoutGrid } from 'lucide-react'
import { SignOutButton } from './SignOutButton'

interface HeaderProps {
  userEmail?: string | null
  showSignOut?: boolean
}

export function Header({ userEmail, showSignOut = true }: HeaderProps) {
  const pathname = usePathname()

  const navLinks = [
    {
      name: 'Board',
      href: '/board',
      icon: LayoutGrid,
    },
    {
      name: 'Post a calculator',
      shortName: 'Post',
      href: '/post',
      icon: PlusCircle,
    },
    {
      name: 'My listings',
      href: '/my-listings',
      icon: ListOrdered,
    },
  ]

  return (
    <header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-3 sm:px-6">
        {/* Main top bar */}
        <div className="h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <Link href="/board" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg leading-tight text-zinc-900 dark:text-zinc-50 tracking-tight">
                CalciShare
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
                VVCE Exchange
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Email & Sign Out */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {userEmail && (
              <span className="hidden lg:inline-block text-xs font-medium text-zinc-500 dark:text-zinc-400 max-w-[180px] truncate">
                {userEmail}
              </span>
            )}
            {showSignOut && <SignOutButton />}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar (visible on screens < md) */}
        <div className="md:hidden pb-2.5 pt-0.5">
          <nav className="grid grid-cols-3 gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all truncate ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">
                    {link.shortName ? (
                      <>
                        <span className="sm:hidden">{link.shortName}</span>
                        <span className="hidden sm:inline">{link.name}</span>
                      </>
                    ) : (
                      link.name
                    )}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
