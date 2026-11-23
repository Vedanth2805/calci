import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://YOUR_DOMAIN'),
  title: {
    default: 'CalciShare | VVCE Scientific Calculator Exchange',
    template: '%s | CalciShare',
  },
  description:
    'Peer-to-peer scientific calculator lending and selling platform exclusively for students of Vidyavardhaka College of Engineering (VVCE), Mysuru.',
  applicationName: 'CalciShare',
  authors: [{ name: 'VVCE Student' }],
  keywords: [
    'CalciShare',
    'VVCE',
    'calculator exchange',
    'scientific calculator',
    'fx-991CW',
    'fx-991EX',
    'engineering calculator',
    'Mysuru',
  ],
  openGraph: {
    title: 'CalciShare | VVCE Scientific Calculator Exchange',
    description:
      'Lend or sell scientific calculators between VVCE juniors and seniors. Instant login with your @vvce.ac.in college ID.',
    url: 'https://YOUR_DOMAIN',
    siteName: 'CalciShare',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'CalciShare | VVCE Scientific Calculator Exchange',
    description:
      'Peer-to-peer scientific calculator exchange exclusively for VVCE college students.',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        {children}
      </body>
    </html>
  )
}
