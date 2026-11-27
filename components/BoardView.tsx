'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import {
  Listing,
  STANDARD_CALCULATOR_MODELS,
  formatRelativeTime,
  formatStudentBadge,
  formatTrustRule,
  formatAvailableUntil,
} from '@/utils/listings'
import { ContactActions } from '@/components/ContactActions'
import {
  Filter,
  GraduationCap,
  Clock,
  Check,
  Flag,
  PlusCircle,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  UserCheck,
  ArrowUpDown,
  ShieldCheck,
  Calendar,
} from 'lucide-react'

interface BoardViewProps {
  initialListings: Listing[]
  initialType: string
  initialModel: string
  initialSort: string
  currentUserId: string
}

export function BoardView({
  initialListings,
  initialType,
  initialModel,
  initialSort,
  currentUserId,
}: BoardViewProps) {
  const [typeFilter, setTypeFilter] = useState<string>(initialType || 'all')
  const [modelFilter, setModelFilter] = useState<string>(initialModel || 'all')
  const [sortBy, setSortBy] = useState<string>(initialSort || 'newest')

  const [listings, setListings] = useState<Listing[]>(initialListings)
  const [hasMore, setHasMore] = useState<boolean>(initialListings.length === 20)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [filtering, setFiltering] = useState<boolean>(false)

  // Report modal state
  const [reportTarget, setReportTarget] = useState<Listing | null>(null)
  const [reportReason, setReportReason] = useState<string>('')
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false)
  const [reportFeedback, setReportFeedback] = useState<{
    status: 'success' | 'already_reported' | 'error'
    message: string
  } | null>(null)
  const [reportedListingIds, setReportedListingIds] = useState<Set<string>>(new Set())

  // Execute query with current filters & sort
  const fetchListings = async (
    targetType: string,
    targetModel: string,
    targetSort: string,
    offset = 0,
    limit = 20
  ) => {
    const supabase = createClient()

    let query = supabase
      .from('listings')
      .select(
        'id, owner_id, calculator_model, type, price, trust_rule, available_until, contact_type, contact_handle, contacts, note, created_at, profiles(admission_year, branch)'
      )
      .eq('status', 'available')
      .lt('report_count', 3)
      .gt('expires_at', new Date().toISOString())

    if (targetSort === 'price_asc') {
      query = query
        .order('price', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })
    } else if (targetSort === 'price_desc') {
      query = query
        .order('price', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
    } else if (targetSort === 'oldest') {
      query = query.order('created_at', { ascending: true })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    query = query.range(offset, offset + limit - 1)

    if (targetType === 'lend' || targetType === 'sell' || targetType === 'request') {
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

  // Handle filter & sort changes
  const applyFilters = async (newType: string, newModel: string, newSort = sortBy) => {
    setTypeFilter(newType)
    setModelFilter(newModel)
    setSortBy(newSort)
    setFiltering(true)

    // Sync query parameters into URL without triggering a redundant server re-render
    const params = new URLSearchParams()
    if (newType !== 'all') params.set('type', newType)
    if (newModel !== 'all') params.set('model', newModel)
    if (newSort !== 'newest') params.set('sort', newSort)
    const queryString = params.toString() ? `?${params.toString()}` : ''
    window.history.replaceState(null, '', `/board${queryString}`)

    try {
      const { data, error } = await fetchListings(newType, newModel, newSort, 0, 20)
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
        sortBy,
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

  const isFiltered = typeFilter !== 'all' || modelFilter !== 'all' || sortBy !== 'newest'

  return (
    <div className="w-full">
      {/* Top Filter Controls */}
      <div className="mb-6 p-5 rounded-3xl bg-[#111612]/60 backdrop-blur-xl border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Filter Type Pills: All / Borrow Free / For Sale / Requests */}
          <div>
            <span className="block text-[11px] font-medium uppercase tracking-wider text-white/40 mb-2">
              Listing Type
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-white/5 border border-white/10 p-1 rounded-2xl sm:rounded-full text-xs font-medium">
              <button
                type="button"
                onClick={() => applyFilters('all', modelFilter)}
                className={`py-1.5 px-3 sm:px-4 rounded-full transition-all duration-300 cursor-pointer text-center ${
                  typeFilter === 'all'
                    ? 'bg-white/15 text-white'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => applyFilters('lend', modelFilter)}
                className={`py-1.5 px-3 sm:px-4 rounded-full transition-all duration-300 cursor-pointer text-center whitespace-nowrap ${
                  typeFilter === 'lend'
                    ? 'bg-brand-green text-black font-semibold shadow-[0_0_15px_rgba(214,248,102,0.25)]'
                    : 'text-white/50 hover:text-brand-green'
                }`}
              >
                To Borrow
              </button>
              <button
                type="button"
                onClick={() => applyFilters('sell', modelFilter)}
                className={`py-1.5 px-3 sm:px-4 rounded-full transition-all duration-300 cursor-pointer text-center whitespace-nowrap ${
                  typeFilter === 'sell'
                    ? 'bg-brand-green text-black font-semibold shadow-[0_0_15px_rgba(214,248,102,0.25)]'
                    : 'text-white/50 hover:text-brand-green'
                }`}
              >
                For Sale
              </button>
              <button
                type="button"
                onClick={() => applyFilters('request', modelFilter)}
                className={`py-1.5 px-3 sm:px-4 rounded-full transition-all duration-300 cursor-pointer text-center whitespace-nowrap ${
                  typeFilter === 'request'
                    ? 'bg-amber-400 text-black font-semibold shadow-[0_0_15px_rgba(251,191,36,0.25)]'
                    : 'text-white/50 hover:text-amber-300'
                }`}
              >
                Requests
              </button>
            </div>
          </div>

          {/* Calculator Model & Sort Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-48">
              <span className="block text-[11px] font-medium uppercase tracking-wider text-white/40 mb-2">
                Calculator Model
              </span>
              <div className="relative">
                <select
                  value={modelFilter}
                  onChange={(e) => applyFilters(typeFilter, e.target.value, sortBy)}
                  className="w-full appearance-none rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white focus:outline-none focus:border-brand-green/50 cursor-pointer"
                >
                  <option value="all" className="bg-[#111612] text-white">All Models</option>
                  {STANDARD_CALCULATOR_MODELS.map((m) => (
                    <option key={m} value={m} className="bg-[#111612] text-white">
                      {m}
                    </option>
                  ))}
                  <option value="Other" className="bg-[#111612] text-white">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-white/40">
                  <Filter className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <div className="w-full sm:w-48">
              <span className="block text-[11px] font-medium uppercase tracking-wider text-white/40 mb-2">
                Sort By
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => applyFilters(typeFilter, modelFilter, e.target.value)}
                  className="w-full appearance-none rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white focus:outline-none focus:border-brand-green/50 cursor-pointer"
                >
                  <option value="newest" className="bg-[#111612] text-white">Newest First</option>
                  <option value="price_asc" className="bg-[#111612] text-white">Price: Low to High</option>
                  <option value="price_desc" className="bg-[#111612] text-white">Price: High to Low</option>
                  <option value="oldest" className="bg-[#111612] text-white">Oldest First</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-white/40">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Status Bar */}
        <div className="flex items-center justify-between text-xs pt-3 border-t border-white/10">
          <span className="text-white/50">
            {filtering ? (
              <span className="inline-flex items-center gap-1.5 text-brand-green">
                <span className="w-2.5 h-2.5 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
                Updating results...
              </span>
            ) : (
              <span>
                Showing <strong className="text-white font-medium">{listings.length}</strong> available calculator{listings.length === 1 ? '' : 's'}
              </span>
            )}
          </span>

          {isFiltered && (
            <button
              onClick={() => applyFilters('all', 'all', 'newest')}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-green hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {listings.length === 0 && !filtering && (
        <div className="text-center py-16 px-4 bg-[#111612]/60 backdrop-blur-xl rounded-3xl border border-white/10">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-green/10 border border-brand-green/20 text-brand-green flex items-center justify-center">
            <Filter className="w-7 h-7" />
          </div>
          {isFiltered ? (
            <>
              <h3 className="text-base sm:text-lg font-medium text-white">
                {typeFilter === 'request'
                  ? 'No active calculator requests right now'
                  : 'No calculators match your filters'}
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-white/50 max-w-sm mx-auto font-light">
                {typeFilter === 'request'
                  ? 'Need a calculator urgently? Post a 24-hour request so peers with a spare can reach out.'
                  : 'Try resetting your filters or post a 24-hour request if you need one urgently.'}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => applyFilters('all', 'all', 'newest')}
                  className="px-4 py-2 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors duration-300 cursor-pointer"
                >
                  Reset Filters
                </button>
                <Link
                  href="/post?intent=request"
                  className="px-4 py-2 rounded-full text-xs font-medium bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-all duration-300"
                >
                  Request a Calculator
                </Link>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-base sm:text-lg font-medium text-white">
                No calculators listed yet. Be the first!
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-white/50 max-w-sm mx-auto font-light">
                Got a calculator you don&apos;t need right now? Help out your fellow VVCE peers by lending or selling it.
              </p>
              <div className="mt-6">
                <Link
                  href="/post"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-brand-green text-black shadow-[0_0_20px_rgba(214,248,102,0.2)] hover:shadow-[0_0_28px_rgba(214,248,102,0.4)] transition-all duration-300"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post a calculator</span>
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {/* In-person safety reminder */}
      {listings.length > 0 && (
        <div className="mb-4 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-[11px] sm:text-xs text-white/60 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-brand-green flex-shrink-0" />
          <span>
            Tip: Check all buttons, display &amp; solar panel in person before paying. CalciShare only connects VVCE students.
          </span>
        </div>
      )}

      {/* Listings Grid (Mobile-First 1 col, md: 2 cols) */}
      {listings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.map((listing) => {
            const isMine = listing.owner_id === currentUserId
            const studentBadge = formatStudentBadge(listing.profiles)
            const trustLabel = listing.type === 'lend' ? formatTrustRule(listing.trust_rule) : null
            const untilLabel = formatAvailableUntil(listing.available_until)
            const isReported = reportedListingIds.has(listing.id)

            return (
              <div
                key={listing.id}
                className="group relative flex flex-col justify-between p-5 rounded-3xl bg-[#111612]/60 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden"
              >
                <div className="relative z-10">
                  {/* Card Header: Model + Lend/Sell Tag + Price */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-white/10">
                    <div className="flex-1">
                      <h3 className="font-medium text-base sm:text-lg text-white leading-tight">
                        {listing.calculator_model}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {/* Student academic badge (e.g. CSE '24) */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 text-white/80 border border-white/10">
                          <GraduationCap className="w-3 h-3 text-brand-green" />
                          <span>{studentBadge}</span>
                        </span>

                        {/* Trust rule badge for lending */}
                        {trustLabel && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/5 text-white/70 border border-white/10">
                            <ShieldCheck className="w-3 h-3 text-brand-green" />
                            <span>{trustLabel}</span>
                          </span>
                        )}

                        {/* Available / Needed until date */}
                        {untilLabel && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/5 text-white/80 border border-white/10">
                            <Calendar className="w-3 h-3 text-amber-300" />
                            <span>
                              {listing.type === 'request' ? `Need till ${untilLabel}` : `Till ${untilLabel}`}
                            </span>
                          </span>
                        )}

                        {/* Relative time posted */}
                        <span className="text-[11px] text-white/40 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatRelativeTime(listing.created_at)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Tag / Price + Subtle Report Icon */}
                    <div className="flex items-start gap-1.5">
                      {listing.type === 'sell' ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/10 border border-white/20">
                          <span className="text-[10px] uppercase tracking-wider font-medium text-white/65">
                            For Sale
                          </span>
                          <span className="text-base sm:text-lg font-semibold text-brand-green leading-none">
                            ₹{listing.price}
                          </span>
                        </div>
                      ) : listing.type === 'request' ? (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-400/35">
                          {listing.price ? `NEEDED • OFFER ₹${listing.price}` : 'NEEDED • REQUEST'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-brand-green/15 text-brand-green border border-brand-green/30">
                          {listing.price ? `BORROW • ₹${listing.price}` : 'BORROW • FREE'}
                        </span>
                      )}

                      {!isMine && (
                        isReported ? (
                          <span
                            className="p-1.5 rounded-full text-brand-green/70"
                            title="Report submitted"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openReportModal(listing)}
                            className="p-1.5 rounded-full text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200 cursor-pointer"
                            title="Report listing"
                            aria-label="Report listing"
                          >
                            <Flag className="w-3.5 h-3.5" />
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Optional Note */}
                  {listing.note && (
                    <div className="mt-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2 text-xs text-white/70">
                      <FileText className="w-3.5 h-3.5 text-white/40 mt-0.5 flex-shrink-0" />
                      <p className="italic leading-relaxed break-words">{listing.note}</p>
                    </div>
                  )}

                  {/* Contact Section */}
                  <div className="mt-3.5 pt-3 border-t border-white/10">
                    <span className="block text-[10px] font-medium uppercase tracking-wider text-white/40 mb-2">
                      {listing.type === 'request' ? 'Help This Student' : 'Contact Owner'}
                    </span>
                    <ContactActions listing={listing} />
                  </div>
                </div>

                {/* Card Footer: Only shown for owner */}
                {isMine && (
                  <div className="relative z-10 mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <Link
                      href="/my-listings"
                      className="inline-flex items-center gap-1.5 text-brand-green hover:underline font-medium"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Your listing (Manage)</span>
                    </Link>
                  </div>
                )}

                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-brand-green/10 blur-[50px] opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none" />
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
            className="w-full sm:w-auto px-6 py-2.5 rounded-full font-medium text-xs sm:text-sm bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all duration-300 disabled:opacity-50 cursor-pointer inline-flex items-center justify-center gap-2"
          >
            {loadingMore ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-brand-green rounded-full animate-spin" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-[#111612] border border-white/15 p-6 shadow-2xl">
            {reportFeedback ? (
              <div className="text-center py-3">
                {reportFeedback.status === 'success' ? (
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-brand-green/15 text-brand-green flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                )}
                <h4 className="font-medium text-base text-white mb-1.5">
                  {reportFeedback.status === 'success'
                    ? 'Report Received'
                    : reportFeedback.status === 'already_reported'
                    ? 'Already Reported'
                    : 'Report Failed'}
                </h4>
                <p className="text-xs sm:text-sm text-white/60 mb-5 leading-relaxed">
                  {reportFeedback.message}
                </p>
                <button
                  type="button"
                  onClick={() => setReportTarget(null)}
                  className="w-full py-2.5 px-4 rounded-full text-xs sm:text-sm font-medium bg-brand-green text-black transition-all duration-300 cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport}>
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <div className="flex items-center gap-2 text-white">
                    <Flag className="w-4 h-4 text-red-400" />
                    <h4 className="font-medium text-sm">Report Listing</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReportTarget(null)}
                    className="text-white/40 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-white/60 mb-3">
                  Flag <strong className="text-white">{reportTarget.calculator_model}</strong>:
                </p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {[
                    'Already sold / lent',
                    'No response',
                    'Wrong price / info',
                    'Spam / inappropriate',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setReportReason(preset)}
                      disabled={isSubmittingReport}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${
                        reportReason === preset
                          ? 'bg-red-500/20 border-red-400/50 text-red-200'
                          : 'bg-white/5 border-white/10 text-white/65 hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1 text-[11px] text-white/40">
                    <span>Details (Optional)</span>
                    <span className="font-mono">{reportReason.length} / 200</span>
                  </div>
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    maxLength={200}
                    rows={2}
                    placeholder="Or add a short note..."
                    disabled={isSubmittingReport}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-green/50 disabled:opacity-50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setReportTarget(null)}
                    disabled={isSubmittingReport}
                    className="w-full py-2 px-3 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingReport}
                    className="w-full py-2 px-3 rounded-full text-xs font-medium bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
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
