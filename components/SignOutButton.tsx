'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('Sign out error:', err)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:text-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
      title="Sign out of CalciShare"
    >
      <LogOut className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
      <span>{loading ? 'Signing out...' : 'Sign out'}</span>
    </button>
  )
}
