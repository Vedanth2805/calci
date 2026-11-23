'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { STANDARD_CALCULATOR_MODELS } from '@/utils/listings'
import { InstagramIcon, DiscordIcon } from '@/components/icons'
import {
  Calculator,
  Tag,
  IndianRupee,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

interface PostListingFormProps {
  userId: string
  activeListingCount: number
}

export function PostListingForm({ userId, activeListingCount }: PostListingFormProps) {
  const router = useRouter()
  const [model, setModel] = useState<string>('')
  const [customModel, setCustomModel] = useState<string>('')
  const [listingType, setListingType] = useState<'lend' | 'sell'>('lend')
  const [price, setPrice] = useState<string>('')
  const [contactType, setContactType] = useState<'instagram' | 'discord'>('instagram')
  const [contactHandle, setContactHandle] = useState<string>('')
  const [note, setNote] = useState<string>('')

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Compute cleaned handle (strip leading @ and trim)
  const cleanedHandle = contactHandle.trim().replace(/^@+/, '').trim()

  const isLimitReached = activeListingCount >= 5

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (isLimitReached) {
      setErrorMessage(
        'You have reached the maximum limit of 5 active listings. Mark an existing listing as done or delete it before posting another.'
      )
      return
    }

    // Validation
    if (!model) {
      setErrorMessage('Please select a calculator model.')
      return
    }

    const finalModel = model === 'Other' ? customModel.trim() : model
    if (model === 'Other') {
      if (!finalModel || finalModel.length < 2) {
        setErrorMessage('Please specify the calculator model (at least 2 characters).')
        return
      }
      if (finalModel.length > 50) {
        setErrorMessage('Calculator model name cannot exceed 50 characters.')
        return
      }
    }

    let parsedPrice: number | null = null
    if (listingType === 'sell') {
      const numPrice = parseInt(price, 10)
      if (isNaN(numPrice) || numPrice <= 0) {
        setErrorMessage('Please enter a valid price in INR (must be greater than 0).')
        return
      }
      if (numPrice > 20000) {
        setErrorMessage('Please enter a realistic student calculator price (max ₹20,000).')
        return
      }
      parsedPrice = numPrice
    }

    if (!cleanedHandle) {
      setErrorMessage('Please enter your contact handle.')
      return
    }

    if (cleanedHandle.length < 2) {
      setErrorMessage('Contact handle must be at least 2 characters long.')
      return
    }

    if (cleanedHandle.length > 50) {
      setErrorMessage('Contact handle cannot exceed 50 characters.')
      return
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(cleanedHandle)) {
      setErrorMessage('Contact handle can only contain letters, numbers, dots, underscores, and hyphens.')
      return
    }

    if (note.trim().length > 200) {
      setErrorMessage('Note cannot exceed 200 characters.')
      return
    }

    try {
      setLoading(true)
      const supabase = createClient()

      const payload = {
        owner_id: userId,
        calculator_model: finalModel,
        type: listingType,
        price: parsedPrice,
        contact_type: contactType,
        contact_handle: cleanedHandle,
        note: note.trim() || null,
        status: 'available',
      }

      const { error } = await supabase.from('listings').insert(payload)

      if (error) {
        if (
          error.message.includes('Listing limit reached') ||
          error.message.includes('5') ||
          error.code === 'P0001'
        ) {
          setErrorMessage(
            'Limit reached: You may have at most 5 active/available listings at once. Please manage your listings in "My listings" first.'
          )
        } else if (error.message.includes('check_listing_price')) {
          setErrorMessage('Invalid price configuration: Sell requires a price > 0, Lend requires no price.')
        } else {
          setErrorMessage(error.message || 'Failed to post listing. Please try again.')
        }
        return
      }

      setSuccess(true)
      router.push('/my-listings')
      router.refresh()
    } catch {
      setErrorMessage('An unexpected error occurred while posting. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* 5-listing limit alert banner */}
      {isLimitReached && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <h3 className="font-semibold">Listing Limit Reached (5/5)</h3>
              <p className="mt-1 text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                You already have 5 active calculator listings. To post another, please mark a finished listing as done or delete an old one.
              </p>
              <div className="mt-3">
                <Link
                  href="/my-listings"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                >
                  Manage My Listings
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active count badge */}
      {!isLimitReached && (
        <div className="mb-4 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
          <span>Active listings limit:</span>
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
            {activeListingCount} / 5 active
          </span>
        </div>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success alert */}
      {success && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
          <span>Listing created! Redirecting to your listings...</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white dark:bg-zinc-900 p-5 sm:p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs"
      >
        {/* Field 1: Calculator Model */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Calculator Model <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={isLimitReached || loading}
              className="w-full appearance-none rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              required
            >
              <option value="">Select calculator model...</option>
              {STANDARD_CALCULATOR_MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
              <option value="Other">Other (specify below)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
              <Calculator className="w-4 h-4" />
            </div>
          </div>

          {/* Conditional Free-Text Field if "Other" is chosen */}
          {model === 'Other' && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Specify Model Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="e.g. fx-991CW, fx-991MS, Texas Instruments"
                maxLength={50}
                disabled={isLimitReached || loading}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                required
              />
            </div>
          )}
        </div>

        {/* Field 2: Lend / Sell Toggle */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Listing Intent <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setListingType('lend')
                setPrice('')
              }}
              disabled={isLimitReached || loading}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                listingType === 'lend'
                  ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-xs sm:text-sm">Lend</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
                  Free
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Lend for exam or semester
              </p>
            </button>

            <button
              type="button"
              onClick={() => setListingType('sell')}
              disabled={isLimitReached || loading}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                listingType === 'sell'
                  ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-xs sm:text-sm">Sell</span>
                <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Sell permanently for cash
              </p>
            </button>
          </div>
        </div>

        {/* Field 3: Price in INR (Only visible and required for Sell) */}
        {listingType === 'sell' && (
          <div className="transition-all animate-in fade-in duration-200">
            <label className="block text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">
              Selling Price (INR) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                <IndianRupee className="w-4 h-4" />
              </div>
              <input
                type="number"
                min="1"
                max="20000"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 500"
                disabled={isLimitReached || loading}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                required={listingType === 'sell'}
              />
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Direct peer payment on handover (cash or UPI).
            </p>
          </div>
        )}

        {/* Field 4: Contact Type & Handle */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Contact Preference <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              onClick={() => setContactType('instagram')}
              disabled={isLimitReached || loading}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                contactType === 'instagram'
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 ring-2 ring-pink-500/20'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              <InstagramIcon className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              <span>Instagram</span>
            </button>

            <button
              type="button"
              onClick={() => setContactType('discord')}
              disabled={isLimitReached || loading}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                contactType === 'discord'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              <DiscordIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Discord</span>
            </button>
          </div>

          {/* Contact Handle Input */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
              <span className="text-xs font-mono font-bold">@</span>
            </div>
            <input
              type="text"
              value={contactHandle}
              onChange={(e) => setContactHandle(e.target.value)}
              placeholder={contactType === 'instagram' ? 'your_instagram_handle' : 'discord_username'}
              maxLength={55}
              disabled={isLimitReached || loading}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 pl-8 pr-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              required
            />
          </div>

          {/* Cleaned handle preview feedback */}
          <div className="mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span>
              {contactType === 'instagram' ? (
                cleanedHandle ? (
                  <>
                    Links to:{' '}
                    <span className="font-mono text-pink-600 dark:text-pink-400">
                      instagram.com/{cleanedHandle}
                    </span>
                  </>
                ) : (
                  'Leading "@" and spaces are automatically removed'
                )
              ) : cleanedHandle ? (
                <>
                  Shows:{' '}
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    {cleanedHandle}
                  </span>{' '}
                  (with 1-click copy)
                </>
              ) : (
                'Leading "@" and spaces are automatically removed'
              )}
            </span>
          </div>
        </div>

        {/* Field 5: Optional Note */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Note (Optional)</span>
            </label>
            <span
              className={`text-[11px] font-mono ${
                note.length > 180 ? 'text-amber-600 font-bold' : 'text-zinc-400'
              }`}
            >
              {note.length} / 200
            </span>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="e.g., Has fresh battery and hard cover. Meet near library or mechanical block."
            disabled={isLimitReached || loading}
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLimitReached || loading}
          className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Posting listing...</span>
            </>
          ) : (
            <>
              <span>Post Calculator</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
