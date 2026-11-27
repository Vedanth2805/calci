export const STANDARD_CALCULATOR_MODELS = [
  'fx-991CW',
  'fx-991EX',
  'fx-991ES Plus',
  'fx-991MS',
  'fx-82MS',
  'fx-570ES Plus',
  'fx-82ES Plus',
] as const

export type StandardCalculatorModel = (typeof STANDARD_CALCULATOR_MODELS)[number]

export type ContactChannel =
  | 'whatsapp'
  | 'phone'
  | 'email'
  | 'telegram'
  | 'instagram'
  | 'discord'

export type ContactMap = Partial<Record<ContactChannel, string>>

export interface ListingProfile {
  admission_year?: number | null
  branch?: string | null
}

export type ListingType = 'lend' | 'sell' | 'request'
export type TrustRule = 'id_proof' | 'none'

export interface Listing {
  id: string
  owner_id: string
  calculator_model: string
  type: ListingType
  price: number | null
  trust_rule?: TrustRule | null
  available_until?: string | null
  contact_type: ContactChannel
  contact_handle: string
  contacts?: ContactMap | null
  note: string | null
  status?: 'available' | 'done'
  created_at: string
  expires_at?: string
  report_count?: number
  profiles?: ListingProfile | ListingProfile[] | null
}

export function formatAvailableUntil(dateStr?: string | null): string | null {
  if (!dateStr) return null
  const [year, month, day] = dateStr.split('-').map(Number)
  if (!year || !month || !day) return null
  const date = new Date(year, month - 1, day)
  if (isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function formatTrustRule(rule?: TrustRule | null): string | null {
  if (rule === 'id_proof') return 'ID photo + Phone'
  if (rule === 'none') return 'No ID needed'
  return null
}

export function getListingContacts(listing: Listing): ContactMap {
  if (listing.contacts && Object.keys(listing.contacts).length > 0) {
    return listing.contacts
  }
  if (listing.contact_type && listing.contact_handle) {
    return { [listing.contact_type]: listing.contact_handle }
  }
  return {}
}

export function normalizeIndianPhone(input: string): string | null {
  const digits = input.replace(/\D/g, '')
  const tenDigit =
    digits.length === 12 && digits.startsWith('91')
      ? digits.slice(2)
      : digits.length === 11 && digits.startsWith('0')
      ? digits.slice(1)
      : digits
  return /^[6-9]\d{9}$/.test(tenDigit) ? tenDigit : null
}

export function getWhatsAppUrl(
  phone: string,
  model: string,
  type: ListingType,
  price: number | null
): string {
  const normalized = normalizeIndianPhone(phone) ?? phone.replace(/\D/g, '')
  const message =
    type === 'request'
      ? price
        ? `Hi! I saw your request for ${model} (offering ₹${price}) on CalciShare. I have one you can use!`
        : `Hi! I saw your urgent request for ${model} on CalciShare. I have one you can use!`
      : type === 'sell' && price
      ? `Hi! I saw your buy (${model} for ₹${price}) listing on CalciShare. Is it still available?`
      : price
      ? `Hi! I saw your borrow (${model} for ₹${price}) listing on CalciShare. Is it still available?`
      : `Hi! I saw your borrow (${model}) listing on CalciShare. Is it still available?`
  const text = encodeURIComponent(message)
  return `https://wa.me/91${normalized}?text=${text}`
}

export function getTelegramUrl(handleOrNumber: string): string {
  const trimmed = handleOrNumber.trim()
  const phone = normalizeIndianPhone(trimmed)
  if (phone) {
    return `https://t.me/+91${phone}`
  }
  if (trimmed.startsWith('+')) {
    return `https://t.me/${trimmed.replace(/[^+\d]/g, '')}`
  }
  const cleanHandle = trimmed.replace(/^@+/, '').replace(/[^a-zA-Z0-9_]/g, '')
  return `https://t.me/${encodeURIComponent(cleanHandle)}`
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
  if (diffMs > 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours < 1) {
      const diffMins = Math.max(1, Math.ceil(diffMs / (1000 * 60)))
      return `Expires in ${diffMins} min${diffMins === 1 ? '' : 's'}`
    }
    if (diffHours < 24) {
      return `Expires in ${diffHours} hour${diffHours === 1 ? '' : 's'}`
    }
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    return `Expires in ${diffDays} day${diffDays === 1 ? '' : 's'}`
  }
  const diffDays = Math.ceil(Math.abs(diffMs) / (1000 * 60 * 60 * 24))
  return `Expired ${diffDays} day${diffDays === 1 ? '' : 's'} ago`
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
