'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  Listing,
  STANDARD_CALCULATOR_MODELS,
  formatRelativeTime,
  formatStudentBadge,
  copyToClipboard,
} from '@/utils/listings'
import { InstagramIcon, DiscordIcon } from '@/components/icons'
import {
  Filter,
  GraduationCap,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Flag,
  PlusCircle,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  UserCheck,
} from 'lucide-react'

interface BoardViewProps {
  initialListings: Listing[]
  initialType: string
  initialModel: string
  currentUserId: string
}

export function BoardView({
  initialListings,
  initialType,
  initialModel,
  currentUserId,
}: BoardViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [typeFilter, setTypeFilter] = useState<string>(initialType || 'all')
  const [modelFilter, setModelFilter] = useState<string>(initialModel || 'all')

  const [listings, setListings] = useState<Listing[]>(initialListings)
  const [hasMore, setHasMore] = useState<boolean>(initialListings.length === 20)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [filtering, setFiltering] = useState<boolean>(false)

  // Discord copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Report modal state
  const [reportTarget, setReportTarget] = useState<Listing | null>(null)
  const [reportReason, setReportReason] = useState<string>('')
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false)
  const [reportFeedback, setReportFeedback] = useState<{
    status: 'success' | 'already_reported' | 'error'
    message: string
  } | null>(null)
  const [reportedListingIds, setReportedListingIds] = useState<Set<string>>(new Set())

  // Execute query with current filters
  const fetchListings = async (
    targetType: string,
    targetModel: string,
    offset = 0,
    limit = 20
  ) => {
    const supabase = createClient()

    let query = supabase
      .from('listings')
      .select(
        'id, owner_id, calculator_model, type, price, contact_type, contact_handle, note, created_at, profiles(admission_year, branch)'
      )
      .eq('status', 'available')
      .lt('report_count', 3)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (targetType === 'lend' || targetType === 'sell') {
      query = query.eq('type', targetType)
    }

    if (targetModel && targetModel !== 'all') {
      if (targetModel === 'Other') {
        query = query.not('calculator_model', 'in', `("${STANDARD_CALCULATOR_MODELS.join('","')}")`)
      } else {
        query = query.eq('calculator_model', targetModel)
      }
    }

    return await query
  }

  // Handle filter changes
  const applyFilters = async (newType: string, newModel: string) => {
    setTypeFilter(newType)
    setModelFilter(newModel)
    setFiltering(true)

    // Sync query parameters into URL
    const params = new URLSearchParams()
    if (newType !== 'all') params.set('type', newType)
    if (newModel !== 'all') params.set('model', newModel)
    const queryString = params.toString() ? `?${params.toString()}` : ''

    startTransition(() => {
      router.replace(`/board${queryString}`, { scroll: false })
    })

    try {
      const { data, error } = await fetchListings(newType, newModel, 0, 20)
      if (!error && data) {
        setListings(data as Listing[])
        setHasMore(data.length === 20)
      }
    } catch (err) {
      console.error('Error filtering listings:', err)
    } finally {
      setFiltering(false)
    }
  }

  // Handle "Load more"
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    try {
      const { data, error } = await fetchListings(
        typeFilter,
        modelFilter,
        listings.length,
        20
      )
      if (!error && data) {
        setListings((prev) => [...prev, ...(data as Listing[])])
        if (data.length < 20) {
          setHasMore(false)
        }
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Error loading more listings:', err)
      setHasMore(false)
    } finally {
      setLoadingMore(false)
    }
  }

  // Handle Discord handle copy
  const handleCopyDiscord = async (id: string, handle: string) => {
    const success = await copyToClipboard(handle)
    if (success) {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  // Open report modal
  const openReportModal = (listing: Listing) => {
    setReportTarget(listing)
    setReportReason('')
    setReportFeedback(null)
  }

  // Submit report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportTarget) return

    setIsSubmittingReport(true)
    setReportFeedback(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.from('reports').insert({
        listing_id: reportTarget.id,
        reporter_id: currentUserId,
        reason: reportReason.trim() || null,
      })

      if (error) {
        if (
          error.code === '23505' ||
          error.message.includes('unique_listing_reporter') ||
          error.message.includes('duplicate key')
        ) {
          setReportFeedback({
            status: 'already_reported',
            message: 'You have already reported this listing previously.',
          })
          setReportedListingIds((prev) => new Set(prev).add(reportTarget.id))
        } else {
          setReportFeedback({
            status: 'error',
            message: 'Could not submit report. Please try again later.',
          })
        }
      } else {
        setReportFeedback({
          status: 'success',
          message: 'Thank you! Your report has been submitted to keep CalciShare clean and safe.',
        })
        setReportedListingIds((prev) => new Set(prev).add(reportTarget.id))
      }
    } catch {
      setReportFeedback({
        status: 'error',
        message: 'An unexpected error occurred while reporting.',
      })
    } finally {
      setIsSubmittingReport(false)
    }
  }

  const isFiltered = typeFilter !== 'all' || modelFilter !== 'all'

  return (
    <div className="w-full">
      {/* Top Filter Controls */}
      <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Filter Type Pills: All / Lend / Sell */}
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Listing Type
            </span>
            <div className="grid grid-cols-3 gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => applyFilters('all', modelFilter)}
                className={`py-1.5 px-3 rounded-lg transition-all cursor-pointer text-center ${
                  typeFilter === 'all'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => applyFilters('lend', modelFilter)}
                className={`py-1.5 px-3 rounded-lg transition-all cursor-pointer text-center ${
                  typeFilter === 'lend'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-emerald-600'
                }`}
              >
                Lend
              </button>
              <button
                type="button"
                onClick={() => applyFilters('sell', modelFilter)}
                className={`py-1.5 px-3 rounded-lg transition-all cursor-pointer text-center ${
                  typeFilter === 'sell'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-blue-600'
                }`}
              >
                Sell
              </button>
            </div>
          </div>

          {/* Calculator Model Dropdown */}
          <div className="w-full sm:w-64">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Calculator Model
            </span>
            <div className="relative">
              <select
                value={modelFilter}
                onChange={(e) => applyFilters(typeFilter, e.target.value)}
                className="w-full appearance-none rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">All Models</option>
                {STANDARD_CALCULATOR_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
                <Filter className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Status Bar */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-zinc-500 dark:text-zinc-400">
            {filtering || isPending ? (
              <span className="inline-flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Updating results...
              </span>
            ) : (
              <span>
                Showing <strong className="text-zinc-900 dark:text-white">{listings.length}</strong> available calculator{listings.length === 1 ? '' : 's'}
              </span>
            )}
          </span>

          {isFiltered && (
            <button
              onClick={() => applyFilters('all', 'all')}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {listings.length === 0 && !filtering && (
        <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Filter className="w-7 h-7" />
          </div>
          {isFiltered ? (
            <>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                No calculators match your filters
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                Try resetting your filters or check back later as peers list their calculators.
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  onClick={() => applyFilters('all', 'all')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
                <Link
                  href="/post"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Post a calculator
                </Link>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                No calculators listed yet. Be the first!
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                Got a calculator you don&apos;t need right now? Help out your fellow VVCE peers by lending or selling it.
              </p>
              <div className="mt-6">
                <Link
                  href="/post"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post a calculator</span>
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {/* Listings Grid (Mobile-First 1 col, md: 2 cols) */}
      {listings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.map((listing) => {
            const isMine = listing.owner_id === currentUserId
            const studentBadge = formatStudentBadge(listing.profiles)
            const isCopied = copiedId === listing.id
            const isReported = reportedListingIds.has(listing.id)
            const sanitizedHandle = listing.contact_handle.replace(/^@+/, '').replace(/[^a-zA-Z0-9._-]/g, '')

            return (
              <div
                key={listing.id}
                className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
              >
                <div>
                  {/* Card Header: Model + Lend/Sell Tag + Price */}
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex-1">
                      <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-50 leading-tight">
                        {listing.calculator_model}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {/* Student academic badge (e.g. CSE '24) */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                          <GraduationCap className="w-3 h-3" />
                          <span>{studentBadge}</span>
                        </span>

                        {/* Relative time posted */}
                        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatRelativeTime(listing.created_at)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Tag / Price */}
                    <div className="flex flex-col items-end">
                      {listing.type === 'sell' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
                          SELL • ₹{listing.price}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                          LEND • FREE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Optional Note */}
                  {listing.note && (
                    <div className="mt-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                      <FileText className="w-3.5 h-3.5 text-zinc-400 mt-0.5 flex-shrink-0" />
                      <p className="italic leading-relaxed break-words">{listing.note}</p>
                    </div>
                  )}

                  {/* Contact Section */}
                  <div className="mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Contact Owner
                    </span>
                    {listing.contact_type === 'instagram' ? (
                      <a
                        href={`https://instagram.com/${encodeURIComponent(sanitizedHandle)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/40 dark:hover:bg-pink-900/40 text-pink-700 dark:text-pink-300 border border-pink-200/80 dark:border-pink-800 text-xs font-semibold transition-colors"
                      >
                        <InstagramIcon className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                        <span>@{sanitizedHandle}</span>
                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                      </a>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 text-xs font-semibold">
                        <DiscordIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-mono">{listing.contact_handle}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyDiscord(listing.id, listing.contact_handle)}
                          className="ml-1 p-1 hover:text-indigo-900 dark:hover:text-white rounded cursor-pointer"
                          title="Copy Discord handle"
                        >
                          {isCopied ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                              <Check className="w-3.5 h-3.5" />
                              Copied!
                            </span>
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Report or Your listing */}
                <div className="mt-4 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  {isMine ? (
                    <Link
                      href="/my-listings"
                      className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Your listing (Manage)</span>
                    </Link>
                  ) : isReported ? (
                    <span className="inline-flex items-center gap-1 text-zinc-400 text-[11px]">
                      <Check className="w-3 h-3" />
                      <span>Report submitted</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openReportModal(listing)}
                      className="inline-flex items-center gap-1 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 text-[11px] font-medium transition-colors cursor-pointer"
                      title="Report inappropriate listing"
                    >
                      <Flag className="w-3 h-3" />
                      <span>Report listing</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination "Load more" button */}
      {hasMore && listings.length > 0 && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-xs transition-all disabled:opacity-50 cursor-pointer inline-flex items-center justify-center gap-2"
          >
            {loadingMore ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
                <span>Loading more...</span>
              </>
            ) : (
              <span>Load more calculators</span>
            )}
          </button>
        </div>
      )}

      {/* Report Modal */}
      {reportTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-xl">
            {reportFeedback ? (
              <div className="text-center py-3">
                {reportFeedback.status === 'success' ? (
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                )}
                <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-50 mb-1.5">
                  {reportFeedback.status === 'success'
                    ? 'Report Received'
                    : reportFeedback.status === 'already_reported'
                    ? 'Already Reported'
                    : 'Report Failed'}
                </h4>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-5 leading-relaxed">
                  {reportFeedback.message}
                </p>
                <button
                  type="button"
                  onClick={() => setReportTarget(null)}
                  className="w-full py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport}>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-3">
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <Flag className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <h4 className="font-bold text-sm">Report Listing</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReportTarget(null)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                  Reporting <strong className="text-zinc-800 dark:text-zinc-200">{reportTarget.calculator_model}</strong>. Please provide a brief reason (e.g., spam, already sold, incorrect price, improper contact).
                </p>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1 text-[11px] text-zinc-400">
                    <span>Reason (Optional)</span>
                    <span className="font-mono">{reportReason.length} / 200</span>
                  </div>
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    maxLength={200}
                    rows={3}
                    placeholder="Enter short reason (max 200 characters)..."
                    disabled={isSubmittingReport}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReportTarget(null)}
                    disabled={isSubmittingReport}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingReport}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isSubmittingReport ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Report</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
