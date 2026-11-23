import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Header } from '@/components/Header'
import { PostListingForm } from '@/components/PostListingForm'
import { Footer } from '@/components/Footer'
import { PlusCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Post a Calculator | CalciShare',
  description:
    'Lend or sell your scientific calculator to fellow VVCE students. Peer-to-peer on campus.',
}

export default async function PostPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Count active/available listings owned by the user
  const { count } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', user.id)
    .eq('status', 'available')

  const activeCount = count ?? 0

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Header userEmail={user.email} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 text-center max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-semibold mb-2">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create a New Listing</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Post a Calculator
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Lend or sell your scientific calculator directly to fellow VVCE students.
          </p>
        </div>

        <PostListingForm userId={user.id} activeListingCount={activeCount} />
      </main>

      <Footer />
    </div>
  )
}
