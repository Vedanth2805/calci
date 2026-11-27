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
    <header className="sticky top-4 sm:top-6 z-20 w-full max-w-5xl mx-auto px-3 sm:px-6">
      <div className="rounded-3xl md:rounded-full backdrop-blur-md bg-white/5 border border-white/10 px-4 sm:px-6 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {/* Main top bar */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-brand-green/15 border border-brand-green/30 flex items-center justify-center text-brand-green group-hover:scale-105 transition-transform duration-300">
              <Calculator className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm sm:text-base leading-tight text-white tracking-tight">
                CalciShare
              </span>
              <span className="text-[9px] sm:text-[10px] font-medium text-brand-green/80 tracking-wider uppercase">
                VVCE Exchange
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-1.5 text-xs font-medium transition-colors duration-300 ${
                    isActive
                      ? 'text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-green' : ''}`} />
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-green shadow-[0_0_8px_#D6F866]" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Email & Sign Out */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {userEmail && (
              <span className="hidden lg:inline-block text-xs font-mono text-white/50 max-w-[180px] truncate">
                {userEmail}
              </span>
            )}
            {showSignOut && <SignOutButton />}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar (visible on screens < md) */}
        <div className="md:hidden mt-2.5 pt-2.5 border-t border-white/10">
          <nav className="grid grid-cols-3 gap-1.5 text-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all duration-300 truncate ${
                    isActive
                      ? 'bg-brand-green text-black shadow-[0_0_15px_rgba(214,248,102,0.2)]'
                      : 'text-white/60 hover:text-white bg-white/5'
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
