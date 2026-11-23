export const STANDARD_CALCULATOR_MODELS = [
  'fx-991ES Plus',
  'fx-991EX',
  'fx-82MS',
  'fx-570ES Plus',
  'fx-82ES Plus',
] as const

export type StandardCalculatorModel = (typeof STANDARD_CALCULATOR_MODELS)[number]

export interface ListingProfile {
  admission_year?: number | null
  branch?: string | null
}

export interface Listing {
  id: string
  owner_id: string
  calculator_model: string
  type: 'lend' | 'sell'
  price: number | null
  contact_type: 'instagram' | 'discord'
  contact_handle: string
  note: string | null
  status?: 'available' | 'done'
  created_at: string
  expires_at?: string
  report_count?: number
  profiles?: ListingProfile | ListingProfile[] | null
}

export function getListingStatus(
  status?: string,
  expiresAt?: string,
  nowMs?: number
): 'available' | 'expired' | 'done' {
  if (status === 'done') return 'done'
  if (expiresAt) {
    const isPast = new Date(expiresAt).getTime() <= (nowMs ?? Date.now())
    if (isPast) return 'expired'
  }
  return 'available'
}

export function getExpiryRemainingText(expiresAt?: string, nowMs?: number): string {
  if (!expiresAt) return ''
  const diffMs = new Date(expiresAt).getTime() - (nowMs ?? Date.now())
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays > 0) {
    return `Expires in ${diffDays} day${diffDays === 1 ? '' : 's'}`
  }
  return `Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} ago`
}

export function formatRelativeTime(dateInput: string | Date): string {
  if (!dateInput) return ''
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (isNaN(diffInSeconds) || diffInSeconds < 0) {
    return 'just now'
  }
  if (diffInSeconds < 60) {
    return 'just now'
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? '1 min ago' : `${diffInMinutes} mins ago`
  }
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`
  }
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`
  }
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`
  }
  const diffInYears = Math.floor(diffInDays / 365)
  return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`
}

export function formatStudentBadge(
  profileInput?: ListingProfile | ListingProfile[] | null
): string {
  if (!profileInput) return 'VVCE Student'

  const profile = Array.isArray(profileInput) ? profileInput[0] : profileInput
  if (!profile) return 'VVCE Student'

  const { admission_year, branch } = profile

  if (branch && admission_year) {
    const year2Digit = String(admission_year).slice(-2)
    return `${branch.toUpperCase()} '${year2Digit}`
  }
  if (branch) {
    return branch.toUpperCase()
  }
  if (admission_year) {
    return `'${String(admission_year).slice(-2)}`
  }
  return 'VVCE Student'
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Fall back to execCommand if navigator.clipboard fails
  }

  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    return successful
  } catch {
    return false
  }
}
