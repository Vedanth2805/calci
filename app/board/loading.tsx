import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function BoardLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-5 space-y-2">
          <div className="h-8 w-56 rounded-xl bg-white/10 animate-pulse" />
          <div className="h-4 w-72 rounded-lg bg-white/5 animate-pulse" />
        </div>

        {/* Filter bar skeleton */}
        <div className="mb-6 p-5 rounded-3xl bg-[#111612]/60 border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="h-10 w-60 rounded-full bg-white/5 animate-pulse" />
            <div className="h-10 w-full sm:w-64 rounded-full bg-white/5 animate-pulse" />
          </div>
          <div className="h-4 w-40 rounded bg-white/5 animate-pulse" />
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-3xl bg-[#111612]/60 border border-white/10 space-y-4"
            >
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-white/10">
                <div className="space-y-2">
                  <div className="h-5 w-32 rounded-lg bg-white/10 animate-pulse" />
                  <div className="h-4 w-24 rounded-full bg-white/5 animate-pulse" />
                </div>
                <div className="h-6 w-20 rounded-full bg-white/10 animate-pulse" />
              </div>
              <div className="h-9 w-40 rounded-full bg-white/5 animate-pulse" />
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
