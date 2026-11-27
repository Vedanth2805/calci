import type { Metadata } from 'next'
import { Inter, PT_Serif } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

const ptSerif = PT_Serif({
  variable: '--font-pt-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['italic'],
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? `https://${process.env.NEXT_PUBLIC_SITE_URL.replace(/^https?:\/\//, '')}`
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'https://calcishare.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    url: siteUrl,
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
      className={`${inter.variable} ${ptSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#050806] text-white font-sans antialiased selection:bg-[#D6F866] selection:text-black">
        {/* Fixed Minimal Background Layer */}
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#050806]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(214,248,102,0.06),transparent_60%)]" />
        </div>

        {/* Main Content Wrapper */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
