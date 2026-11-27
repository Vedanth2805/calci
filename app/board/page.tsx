import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getVerifiedUser } from '@/utils/supabase/auth'
import { Header } from '@/components/Header'
import { BoardView } from '@/components/BoardView'
import { Footer } from '@/components/Footer'
import { STANDARD_CALCULATOR_MODELS, Listing } from '@/utils/listings'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Available Calculators | CalciShare',
  description:
    'Browse scientific calculators available to lend or buy from verified VVCE batchmates.',
}

interface BoardPageProps {
  searchParams: Promise<{ type?: string; model?: string; sort?: string }>
}

export default async function BoardPage({ searchParams }: BoardPageProps) {
  const user = await getVerifiedUser()

  if (!user) {
    redirect('/')
  }

  const supabase = await createClient()

  const resolvedParams = await searchParams
  const typeFilter = resolvedParams?.type || 'all'
  const modelFilter = resolvedParams?.model || 'all'
  const sortBy = resolvedParams?.sort || 'newest'

  // Build the initial query on the server (first 20 rows, selected columns only)
  let query = supabase
    .from('listings')
    .select(
      'id, owner_id, calculator_model, type, price, trust_rule, available_until, contact_type, contact_handle, contacts, note, created_at, profiles(admission_year, branch)'
    )
    .eq('status', 'available')
    .lt('report_count', 3)
    .gt('expires_at', new Date().toISOString())

  if (sortBy === 'price_asc') {
    query = query
      .order('price', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
  } else if (sortBy === 'price_desc') {
    query = query
      .order('price', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
  } else if (sortBy === 'oldest') {
    query = query.order('created_at', { ascending: true })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  query = query.range(0, 19)

  if (typeFilter === 'lend' || typeFilter === 'sell' || typeFilter === 'request') {
    query = query.eq('type', typeFilter)
  }

  if (modelFilter && modelFilter !== 'all') {
    if (modelFilter === 'Other') {
      query = query.not('calculator_model', 'in', `("${STANDARD_CALCULATOR_MODELS.join('","')}")`)
    } else {
      query = query.eq('calculator_model', modelFilter)
    }
  }

  const { data: initialListings, error } = await query

  if (error) {
    console.error('Error fetching initial board listings:', error)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header userEmail={user.email} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Compact Board Heading */}
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-white leading-tight">
            Available <span className="font-serif italic text-brand-green font-normal">Calculators</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/55 mt-1 font-light">
            Borrow for free or buy used from verified VVCE batchmates.
          </p>
        </div>

        {/* Interactive Board View (Filters, Cards, Report Modal, Pagination) */}
        <BoardView
          initialListings={(initialListings as Listing[]) || []}
          initialType={typeFilter}
          initialModel={modelFilter}
          initialSort={sortBy}
          currentUserId={user.id}
        />
      </main>

      <Footer />
    </div>
  )
}
