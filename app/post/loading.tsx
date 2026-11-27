import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function PostLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-5 text-center max-w-lg mx-auto space-y-2 flex flex-col items-center">
          <div className="h-8 w-52 rounded-xl bg-white/10 animate-pulse" />
          <div className="h-4 w-64 rounded-lg bg-white/5 animate-pulse" />
        </div>

        <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#111612]/60 border border-white/10 space-y-6">
          <div className="h-12 w-full rounded-2xl bg-white/5 animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 rounded-2xl bg-white/5 animate-pulse" />
            <div className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          </div>
          <div className="h-12 w-full rounded-2xl bg-white/5 animate-pulse" />
          <div className="h-24 w-full rounded-2xl bg-white/5 animate-pulse" />
          <div className="h-12 w-full rounded-full bg-brand-green/20 animate-pulse" />
        </div>
      </main>

      <Footer />
    </div>
  )
}
