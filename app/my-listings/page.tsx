import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getVerifiedUser } from '@/utils/supabase/auth'
import { Header } from '@/components/Header'
import { MyListingsView } from '@/components/MyListingsView'
import { Footer } from '@/components/Footer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My Listings | CalciShare',
  description:
    'Manage your posted calculator listings, renew for 30 days, mark as done, or delete.',
}

export default async function MyListingsPage() {
  const user = await getVerifiedUser()

  if (!user) {
    redirect('/')
  }

  const supabase = await createClient()

  // Fetch the user's own listings (all statuses: available, done, expired)
  const { data: listings } = await supabase
    .from('listings')
    .select(
      'id, owner_id, calculator_model, type, price, trust_rule, available_until, contact_type, contact_handle, contacts, note, status, created_at, expires_at, report_count'
    )
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col">
      <Header userEmail={user.email} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-white leading-tight">
            My <span className="font-serif italic text-brand-green font-normal">Listings</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/55 mt-1 font-light">
            Mark handed-over calculators as done, renew expired posts, or delete listings.
          </p>
        </div>

        <MyListingsView
          initialListings={listings || []}
          userId={user.id}
        />
      </main>

      <Footer />
    </div>
  )
}
