import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function MyListingsLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-5 space-y-2">
          <div className="h-8 w-44 rounded-xl bg-white/10 animate-pulse" />
          <div className="h-4 w-72 rounded-lg bg-white/5 animate-pulse" />
        </div>

        <div className="mb-6 p-5 rounded-3xl bg-[#111612]/60 border border-white/10 flex items-center justify-between">
          <div className="h-10 w-48 rounded-2xl bg-white/5 animate-pulse" />
          <div className="h-9 w-36 rounded-full bg-brand-green/20 animate-pulse" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-3xl bg-[#111612]/60 border border-white/10 space-y-4"
            >
              <div className="flex items-start justify-between pb-3 border-b border-white/10">
                <div className="h-6 w-36 rounded-lg bg-white/10 animate-pulse" />
                <div className="h-6 w-24 rounded-full bg-white/10 animate-pulse" />
              </div>
              <div className="h-8 w-48 rounded-full bg-white/5 animate-pulse" />
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
