import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Header } from '@/components/Header'
import { BoardView } from '@/components/BoardView'
import { Footer } from '@/components/Footer'
import { STANDARD_CALCULATOR_MODELS, Listing } from '@/utils/listings'
import { Calculator } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Available Calculators | CalciShare',
  description:
    'Browse scientific calculators available to lend or buy from verified VVCE batchmates.',
}

interface BoardPageProps {
  searchParams: Promise<{ type?: string; model?: string }>
}

export default async function BoardPage({ searchParams }: BoardPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const resolvedParams = await searchParams
  const typeFilter = resolvedParams?.type || 'all'
  const modelFilter = resolvedParams?.model || 'all'

  // Build the initial query on the server (first 20 rows, selected columns only)
  let query = supabase
    .from('listings')
    .select(
      'id, owner_id, calculator_model, type, price, contact_type, contact_handle, note, created_at, profiles(admission_year, branch)'
    )
    .eq('status', 'available')
    .lt('report_count', 3)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .range(0, 19)

  if (typeFilter === 'lend' || typeFilter === 'sell') {
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
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Header userEmail={user.email} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Board Heading Banner */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-semibold mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>VVCE Student Exchange</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Available Calculators
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Browse scientific calculators available to lend or buy from verified VVCE batchmates.
          </p>
        </div>

        {/* Interactive Board View (Filters, Cards, Report Modal, Pagination) */}
        <BoardView
          initialListings={(initialListings as Listing[]) || []}
          initialType={typeFilter}
          initialModel={modelFilter}
          currentUserId={user.id}
        />
      </main>

      <Footer />
    </div>
  )
}
