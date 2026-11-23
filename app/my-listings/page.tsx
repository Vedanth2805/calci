import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Header } from '@/components/Header'
import { MyListingsView } from '@/components/MyListingsView'
import { Footer } from '@/components/Footer'
import { ListOrdered } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My Listings | CalciShare',
  description:
    'Manage your posted calculator listings, renew for 30 days, mark as done, or delete.',
}

export default async function MyListingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Fetch the user's own listings (all statuses: available, done, expired)
  const { data: listings } = await supabase
    .from('listings')
    .select(
      'id, owner_id, calculator_model, type, price, contact_type, contact_handle, note, status, created_at, expires_at, report_count'
    )
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Header userEmail={user.email} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-semibold mb-2">
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Manage Your Posts</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            My Calculator Listings
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Track status, mark listings as done once handed over, renew expired items, or delete posts.
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
