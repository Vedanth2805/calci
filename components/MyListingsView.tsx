'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  Listing,
  formatRelativeTime,
  copyToClipboard,
  getListingStatus,
  getExpiryRemainingText,
} from '@/utils/listings'
import { InstagramIcon, DiscordIcon } from '@/components/icons'
import {
  PlusCircle,
  Tag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  RotateCw,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  X,
  FileText,
  Calendar,
} from 'lucide-react'

interface MyListingsViewProps {
  initialListings: Listing[]
  userId: string
}

export function MyListingsView({ initialListings, userId }: MyListingsViewProps) {
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>(initialListings)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Action loading states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Count active/available listings
  const activeCount = listings.filter((l) => getListingStatus(l.status, l.expires_at) === 'available').length

  const handleCopyDiscord = async (id: string, handle: string) => {
    const success = await copyToClipboard(handle)
    if (success) {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const handleMarkAsDone = async (listing: Listing) => {
    try {
      setActionLoadingId(listing.id)
      setFeedbackMessage(null)
      const supabase = createClient()

      const { error } = await supabase
        .from('listings')
        .update({ status: 'done' })
        .eq('id', listing.id)
        .eq('owner_id', userId)

      if (error) {
        setFeedbackMessage({ type: 'error', text: 'Failed to mark as done. Please try again.' })
        return
      }

      setListings((prev) =>
        prev.map((item) => (item.id === listing.id ? { ...item, status: 'done' } : item))
      )
      setFeedbackMessage({ type: 'success', text: `"${listing.calculator_model}" marked as done!` })
      router.refresh()
    } catch {
      setFeedbackMessage({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleRenew30Days = async (listing: Listing) => {
    try {
      setActionLoadingId(listing.id)
      setFeedbackMessage(null)
      const supabase = createClient()

      const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

      const { error } = await supabase
        .from('listings')
        .update({ expires_at: newExpiry })
        .eq('id', listing.id)
        .eq('owner_id', userId)

      if (error) {
        setFeedbackMessage({ type: 'error', text: 'Failed to renew listing. Please try again.' })
        return
      }

      setListings((prev) =>
        prev.map((item) => (item.id === listing.id ? { ...item, expires_at: newExpiry } : item))
      )
      setFeedbackMessage({ type: 'success', text: `"${listing.calculator_model}" renewed for 30 days!` })
      router.refresh()
    } catch {
      setFeedbackMessage({ type: 'error', text: 'An unexpected error occurred while renewing.' })
    } finally {
      setActionLoadingId(null)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    try {
      setIsDeleting(true)
      const supabase = createClient()

      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', deleteTarget.id)
        .eq('owner_id', userId)

      if (error) {
        setFeedbackMessage({ type: 'error', text: 'Failed to delete listing. Please try again.' })
        return
      }

      setListings((prev) => prev.filter((item) => item.id !== deleteTarget.id))
      setFeedbackMessage({
        type: 'success',
        text: `Listing for "${deleteTarget.calculator_model}" deleted successfully.`,
      })
      setDeleteTarget(null)
      router.refresh()
    } catch {
      setFeedbackMessage({ type: 'error', text: 'An unexpected error occurred during deletion.' })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="w-full">
      {/* Overview & Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Active Listings: {activeCount} / 5
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {5 - activeCount > 0
                ? `You can post ${5 - activeCount} more active calculator${5 - activeCount === 1 ? '' : 's'}.`
                : 'Maximum limit of 5 active listings reached.'}
            </p>
          </div>
        </div>

        <Link
          href="/post"
          className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeCount >= 5
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed opacity-60'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-500/20'
          }`}
          onClick={(e) => {
            if (activeCount >= 5) {
              e.preventDefault()
              setFeedbackMessage({
                type: 'error',
                text: 'You have reached the maximum of 5 active listings. Mark one as done or delete an existing listing first.',
              })
            }
          }}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post a calculator</span>
        </Link>
      </div>

      {/* Feedback Toast Banner */}
      {feedbackMessage && (
        <div
          className={`mb-6 p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3 transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Empty State */}
      {listings.length === 0 && (
        <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Tag className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
            You have not listed any calculators yet
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Lend your unused calculator to a junior or sell it to someone preparing for their exams.
          </p>
          <div className="mt-6">
            <Link
              href="/post"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Your First Calculator</span>
            </Link>
          </div>
        </div>
      )}

      {/* Listings List */}
      {listings.length > 0 && (
        <div className="space-y-4">
          {listings.map((listing) => {
            const status = getListingStatus(listing.status, listing.expires_at)
            const isLoading = actionLoadingId === listing.id
            const isCopied = copiedId === listing.id
            const expiryText = getExpiryRemainingText(listing.expires_at)
            const sanitizedHandle = listing.contact_handle.replace(/^@+/, '').replace(/[^a-zA-Z0-9._-]/g, '')

            return (
              <div
                key={listing.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                {/* Header row: Model + Status Badge */}
                <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-50">
                        {listing.calculator_model}
                      </h3>

                      {/* Lend / Sell Pill */}
                      {listing.type === 'sell' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                          SELL • ₹{listing.price}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          LEND • FREE
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>Posted {formatRelativeTime(listing.created_at)}</span>
                    </p>
                  </div>

                  {/* Status Indicator Badge */}
                  <div>
                    {status === 'available' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Available
                      </span>
                    )}
                    {status === 'expired' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3 h-3" />
                        Expired
                      </span>
                    )}
                    {status === 'done' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        <CheckCircle2 className="w-3 h-3" />
                        Done
                      </span>
                    )}
                  </div>
                </div>

                {/* Body: Note & Contact Details */}
                <div className="py-3 text-xs sm:text-sm space-y-2.5">
                  {listing.note && (
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                      <FileText className="w-3.5 h-3.5 text-zinc-400 mt-0.5 flex-shrink-0" />
                      <span className="italic break-words">{listing.note}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    {/* Contact handle */}
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500">Contact:</span>
                      {listing.contact_type === 'instagram' ? (
                        <a
                          href={`https://instagram.com/${encodeURIComponent(sanitizedHandle)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-pink-600 dark:text-pink-400 hover:underline"
                        >
                          <InstagramIcon className="w-3.5 h-3.5" />
                          <span>@{sanitizedHandle}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-mono text-indigo-600 dark:text-indigo-400">
                          <DiscordIcon className="w-3.5 h-3.5" />
                          <span>{listing.contact_handle}</span>
                          <button
                            onClick={() => handleCopyDiscord(listing.id, listing.contact_handle)}
                            className="p-1 hover:text-indigo-800 dark:hover:text-indigo-200 cursor-pointer"
                            title="Copy Discord handle"
                          >
                            {isCopied ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Expiration detail */}
                    {status !== 'done' && expiryText && (
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {expiryText}
                      </span>
                    )}

                    {/* Report count notice if any */}
                    {listing.report_count && listing.report_count > 0 ? (
                      <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {listing.report_count} report{listing.report_count === 1 ? '' : 's'} received
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Actions Row */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Mark as done (only if status is available or expired) */}
                    {listing.status === 'available' && (
                      <button
                        onClick={() => handleMarkAsDone(listing)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{isLoading ? 'Updating...' : 'Mark as done'}</span>
                      </button>
                    )}

                    {/* Renew 30 days (only if status is available) */}
                    {listing.status === 'available' && (
                      <button
                        onClick={() => handleRenew30Days(listing)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Extend visibility for 30 more days"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>{isLoading ? 'Renewing...' : 'Renew 30 days'}</span>
                      </button>
                    )}
                  </div>

                  {/* Delete button (with confirmation modal) */}
                  <button
                    onClick={() => setDeleteTarget(listing)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer ml-auto"
                    title="Delete this listing permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-xl">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-3">
              <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/60">
                <Trash2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                Delete Calculator Listing?
              </h4>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-5">
              Are you sure you want to permanently delete your listing for{' '}
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {deleteTarget.calculator_model}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="w-full py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="w-full py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
