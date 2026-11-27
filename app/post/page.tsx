import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getVerifiedUser } from '@/utils/supabase/auth'
import { Header } from '@/components/Header'
import { PostListingForm } from '@/components/PostListingForm'
import { Footer } from '@/components/Footer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Post a Calculator | CalciShare',
  description:
    'Lend or sell your scientific calculator to fellow VVCE students. Peer-to-peer on campus.',
}

interface PostPageProps {
  searchParams: Promise<{ intent?: string }>
}

export default async function PostPage({ searchParams }: PostPageProps) {
  const user = await getVerifiedUser()

  if (!user) {
    redirect('/')
  }

  const resolvedParams = await searchParams
  const initialIntent =
    resolvedParams?.intent === 'sell' || resolvedParams?.intent === 'request'
      ? resolvedParams.intent
      : 'lend'

  const supabase = await createClient()

  // Count active/available, unexpired listings owned by the user
  const { count } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', user.id)
    .eq('status', 'available')
    .gt('expires_at', new Date().toISOString())

  const activeCount = count ?? 0

  return (
    <div className="min-h-screen flex flex-col">
      <Header userEmail={user.email} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-5 text-center max-w-lg mx-auto">
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-white leading-tight">
            Post a <span className="font-serif italic text-brand-green font-normal">Calculator</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/55 mt-1 font-light">
            Lend or sell directly to fellow VVCE students.
          </p>
        </div>

        <PostListingForm
          userId={user.id}
          userEmail={user.email ?? ''}
          activeListingCount={activeCount}
          initialIntent={initialIntent}
        />
      </main>

      <Footer />
    </div>
  )
}
