'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  Listing,
  formatRelativeTime,
  getListingStatus,
  getExpiryRemainingText,
  formatAvailableUntil,
} from '@/utils/listings'
import { ContactActions } from '@/components/ContactActions'
import {
  PlusCircle,
  Tag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  RotateCw,
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

  // Action loading states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Count active/available listings
  const activeCount = listings.filter((l) => getListingStatus(l.status, l.expires_at) === 'available').length

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

  const handleRenewListing = async (listing: Listing, is7DayRequest: boolean) => {
    try {
      setActionLoadingId(listing.id)
      setFeedbackMessage(null)
      const supabase = createClient()

      const durationMs =
        listing.type === 'request'
          ? is7DayRequest
            ? 7 * 24 * 60 * 60 * 1000
            : 24 * 60 * 60 * 1000
          : 30 * 24 * 60 * 60 * 1000
      const newExpiry = new Date(Date.now() + durationMs).toISOString()

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
      const renewedLabel =
        listing.type === 'request' ? (is7DayRequest ? '7 days' : '24 hours') : '30 days'
      setFeedbackMessage({
        type: 'success',
        text: `"${listing.calculator_model}" renewed for ${renewedLabel}!`,
      })
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 p-5 rounded-3xl bg-[#111612]/60 backdrop-blur-xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-green/10 border border-brand-green/20 text-brand-green">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-white">
              Active Listings: {activeCount} / 5
            </h2>
            <p className="text-xs text-white/50">
              {5 - activeCount > 0
                ? `You can post ${5 - activeCount} more active calculator${5 - activeCount === 1 ? '' : 's'}.`
                : 'Maximum limit of 5 active listings reached.'}
            </p>
          </div>
        </div>

        <Link
          href="/post"
          className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
            activeCount >= 5
              ? 'bg-white/5 text-white/30 cursor-not-allowed opacity-60 border border-white/10'
              : 'bg-brand-green text-black shadow-[0_0_20px_rgba(214,248,102,0.2)] hover:shadow-[0_0_28px_rgba(214,248,102,0.4)]'
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
          className={`mb-6 p-4 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-3 transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-brand-green/10 border-brand-green/30 text-brand-green'
              : 'bg-red-500/10 border-red-400/30 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-white/40 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Empty State */}
      {listings.length === 0 && (
        <div className="text-center py-16 px-4 bg-[#111612]/60 backdrop-blur-xl rounded-3xl border border-white/10">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-green/10 border border-brand-green/20 text-brand-green flex items-center justify-center">
            <Tag className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-white">
            You have not listed any calculators yet
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-white/50 max-w-sm mx-auto font-light">
            Lend your unused calculator to a junior or sell it to someone preparing for their exams.
          </p>
          <div className="mt-6">
            <Link
              href="/post"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-brand-green text-black shadow-[0_0_20px_rgba(214,248,102,0.2)] hover:shadow-[0_0_28px_rgba(214,248,102,0.4)] transition-all duration-300"
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
            const expiryText = getExpiryRemainingText(listing.expires_at)
            const untilLabel = formatAvailableUntil(listing.available_until)
            const is7DayRequest =
              listing.type === 'request' &&
              Boolean(listing.expires_at) &&
              new Date(listing.expires_at!).getTime() - new Date(listing.created_at).getTime() >
                48 * 60 * 60 * 1000

            return (
              <div
                key={listing.id}
                className="p-5 rounded-3xl bg-[#111612]/60 backdrop-blur-xl border border-white/10 transition-all duration-300 hover:border-white/20"
              >
                {/* Header row: Model + Status Badge */}
                <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-base sm:text-lg text-white">
                        {listing.calculator_model}
                      </h3>

                      {/* Lend / Sell / Request Pill */}
                      {listing.type === 'sell' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-white border border-white/15">
                          SELL • ₹{listing.price}
                        </span>
                      ) : listing.type === 'request' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-400/35">
                          {listing.price ? `REQUEST • OFFER ₹${listing.price}` : 'REQUEST'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-brand-green/15 text-brand-green border border-brand-green/30">
                          {listing.price ? `LEND • ₹${listing.price}` : 'LEND • FREE'}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-white/40 mt-1.5 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Posted {formatRelativeTime(listing.created_at)}</span>
                      </span>
                      {untilLabel && (
                        <span className="inline-flex items-center gap-1 text-amber-300/90">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {listing.type === 'request' ? `Need till ${untilLabel}` : `Till ${untilLabel}`}
                          </span>
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Status Indicator Badge */}
                  <div>
                    {status === 'available' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-green/10 text-brand-green border border-brand-green/30">
                        <span className="w-2 h-2 rounded-full bg-brand-green shadow-[0_0_8px_#D6F866]" />
                        Available
                      </span>
                    )}
                    {status === 'expired' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-400/30">
                        <Clock className="w-3 h-3" />
                        Expired
                      </span>
                    )}
                    {status === 'done' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/60 border border-white/10">
                        <CheckCircle2 className="w-3 h-3" />
                        Done
                      </span>
                    )}
                  </div>
                </div>

                {/* Body: Note & Contact Details */}
                <div className="py-3.5 text-xs sm:text-sm space-y-2.5">
                  {listing.note && (
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2 text-white/70">
                      <FileText className="w-3.5 h-3.5 text-white/40 mt-0.5 flex-shrink-0" />
                      <span className="italic break-words">{listing.note}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    {/* Contact handles */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-white/40">Contact:</span>
                      <ContactActions listing={listing} />
                    </div>

                    {/* Expiration detail */}
                    {status !== 'done' && expiryText && (
                      <span className="text-[11px] text-white/40 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {expiryText}
                      </span>
                    )}

                    {/* Report count notice if any */}
                    {listing.report_count && listing.report_count > 0 ? (
                      <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {listing.report_count} report{listing.report_count === 1 ? '' : 's'} received
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Actions Row */}
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Mark as done (only if status is available or expired) */}
                    {listing.status === 'available' && (
                      <button
                        onClick={() => handleMarkAsDone(listing)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                        <span>{isLoading ? 'Updating...' : 'Mark as done'}</span>
                      </button>
                    )}

                    {/* Renew (only if status is available) */}
                    {listing.status === 'available' && (
                      <button
                        onClick={() => handleRenewListing(listing, is7DayRequest)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-brand-green/10 hover:bg-brand-green/20 border border-brand-green/30 text-brand-green transition-colors disabled:opacity-50 cursor-pointer"
                        title={
                          listing.type === 'request'
                            ? `Extend request visibility for ${is7DayRequest ? '7 more days' : '24 more hours'}`
                            : 'Extend visibility for 30 more days'
                        }
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>
                          {isLoading
                            ? 'Renewing...'
                            : listing.type === 'request'
                            ? is7DayRequest
                              ? 'Renew 7 days'
                              : 'Renew 24h'
                            : 'Renew 30 days'}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Delete button (with confirmation modal) */}
                  <button
                    onClick={() => setDeleteTarget(listing)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer ml-auto"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-[#111612] border border-white/15 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-400/20">
                <Trash2 className="w-5 h-5" />
              </div>
              <h4 className="font-medium text-base text-white">
                Delete Calculator Listing?
              </h4>
            </div>

            <p className="text-xs sm:text-sm text-white/60 leading-relaxed mb-5">
              Are you sure you want to permanently delete your listing for{' '}
              <span className="font-medium text-white">
                {deleteTarget.calculator_model}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="w-full py-2 px-3 rounded-full text-xs sm:text-sm font-medium border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="w-full py-2 px-3 rounded-full text-xs sm:text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
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
