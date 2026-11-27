import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export interface VerifiedUser {
  id: string
  email: string | null
}

/**
 * Returns the authenticated user without repeating a network call to Supabase Auth
 * when middleware has already validated the session and attached x-user-id/x-user-email.
 */
export async function getVerifiedUser(): Promise<VerifiedUser | null> {
  const headerStore = await headers()
  const middlewareUserId = headerStore.get('x-user-id')

  if (middlewareUserId) {
    return {
      id: middlewareUserId,
      email: headerStore.get('x-user-email'),
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return {
    id: user.id,
    email: user.email ?? null,
  }
}
