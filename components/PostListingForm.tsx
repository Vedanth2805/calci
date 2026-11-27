'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import {
  STANDARD_CALCULATOR_MODELS,
  ContactChannel,
  ContactMap,
  ListingType,
  TrustRule,
  normalizeIndianPhone,
} from '@/utils/listings'
import { InstagramIcon, DiscordIcon } from '@/components/icons'
import {
  Calculator,
  Tag,
  IndianRupee,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Phone,
  Mail,
  Send,
  Check,
  HandHelping,
  ShieldCheck,
  Calendar,
} from 'lucide-react'

interface PostListingFormProps {
  userId: string
  userEmail: string
  activeListingCount: number
  initialIntent?: ListingType
}

export function PostListingForm({
  userId,
  userEmail,
  activeListingCount,
  initialIntent = 'lend',
}: PostListingFormProps) {
  const router = useRouter()
  const [model, setModel] = useState<string>('')
  const [customModel, setCustomModel] = useState<string>('')
  const [listingType, setListingType] = useState<ListingType>(initialIntent)
  const [price, setPrice] = useState<string>('')
  const [lendFeeMode, setLendFeeMode] = useState<'free' | '10' | '20' | 'custom'>('free')
  const [lendCustomPrice, setLendCustomPrice] = useState<string>('')
  const [trustRule, setTrustRule] = useState<TrustRule>('id_proof')
  const [requestDuration, setRequestDuration] = useState<'24h' | '7d'>('24h')
  const [requestOfferMode, setRequestOfferMode] = useState<'free' | '10' | '20' | 'custom'>('free')
  const [requestCustomOffer, setRequestCustomOffer] = useState<string>('')
  const [availableUntil, setAvailableUntil] = useState<string>('')

  const [enabledChannels, setEnabledChannels] = useState<Record<Exclude<ContactChannel, 'email'>, boolean>>({
    whatsapp: true,
    phone: false,
    telegram: false,
    instagram: false,
    discord: false,
  })
  const [whatsappInput, setWhatsappInput] = useState<string>('')
  const [phoneInput, setPhoneInput] = useState<string>('')
  const [telegramInput, setTelegramInput] = useState<string>('')
  const [instagramInput, setInstagramInput] = useState<string>('')
  const [discordInput, setDiscordInput] = useState<string>('')

  const [note, setNote] = useState<string>('')

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isLimitReached = activeListingCount >= 5

  const toggleChannel = (channel: Exclude<ContactChannel, 'email'>) => {
    setEnabledChannels((prev) => ({ ...prev, [channel]: !prev[channel] }))
  }

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
    } else if (listingType === 'lend' || listingType === 'request') {
      const feeMode = listingType === 'lend' ? lendFeeMode : requestOfferMode
      const customRaw = listingType === 'lend' ? lendCustomPrice : requestCustomOffer
      const label = listingType === 'lend' ? 'Lending fee' : 'Offer amount'

      if (feeMode === '10') {
        parsedPrice = 10
      } else if (feeMode === '20') {
        parsedPrice = 20
      } else if (feeMode === 'custom') {
        const numFee = parseInt(customRaw, 10)
        if (isNaN(numFee) || numFee <= 0) {
          setErrorMessage(`Please enter a valid ${label.toLowerCase()} (at least ₹1).`)
          return
        }
        if (numFee >= 100) {
          setErrorMessage(`${label} must be below ₹100 (₹1–₹99).`)
          return
        }
        parsedPrice = numFee
      }
    }

    // Build and validate selected instant contact methods (at least 1 required)
    const contacts: ContactMap = {}

    if (enabledChannels.whatsapp) {
      const normalized = normalizeIndianPhone(whatsappInput)
      if (!normalized) {
        setErrorMessage('Please enter a valid 10-digit WhatsApp mobile number.')
        return
      }
      contacts.whatsapp = normalized
    }

    if (enabledChannels.phone) {
      const normalized = normalizeIndianPhone(phoneInput)
      if (!normalized) {
        setErrorMessage('Please enter a valid 10-digit phone number for calls.')
        return
      }
      contacts.phone = normalized
    }

    if (enabledChannels.telegram) {
      const rawTg = telegramInput.trim()
      const tgPhone = normalizeIndianPhone(rawTg)
      const tgUser = rawTg.replace(/^@+/, '').trim()
      if (tgPhone) {
        contacts.telegram = tgPhone
      } else if (tgUser.length >= 3 && tgUser.length <= 50 && /^[a-zA-Z0-9_]+$/.test(tgUser)) {
        contacts.telegram = tgUser
      } else {
        setErrorMessage('Please enter a valid Telegram @username or 10-digit mobile number.')
        return
      }
    }

    if (enabledChannels.instagram) {
      const ig = instagramInput.trim().replace(/^@+/, '').trim()
      if (ig.length < 2 || ig.length > 50 || !/^[a-zA-Z0-9._-]+$/.test(ig)) {
        setErrorMessage('Please enter a valid Instagram username (letters, numbers, dots, underscores).')
        return
      }
      contacts.instagram = ig
    }

    if (enabledChannels.discord) {
      const dc = discordInput.trim().replace(/^@+/, '').trim()
      if (dc.length < 2 || dc.length > 50 || !/^[a-zA-Z0-9._-]+$/.test(dc)) {
        setErrorMessage('Please enter a valid Discord username.')
        return
      }
      contacts.discord = dc
    }

    const instantEntries = Object.entries(contacts) as [ContactChannel, string][]
    if (instantEntries.length === 0) {
      setErrorMessage('Please add at least one instant contact method (WhatsApp, Call, Telegram, Instagram, or Discord).')
      return
    }

    if (userEmail) {
      contacts.email = userEmail
    }

    const [primaryContactType, primaryContactHandle] = instantEntries[0]

    if (note.trim().length > 200) {
      setErrorMessage('Note cannot exceed 200 characters.')
      return
    }

    try {
      setLoading(true)
      const supabase = createClient()

      const defaultDurationMs =
        listingType === 'request'
          ? requestDuration === '7d'
            ? 7 * 24 * 60 * 60 * 1000
            : 24 * 60 * 60 * 1000
          : 30 * 24 * 60 * 60 * 1000

      let expiresAtMs = Date.now() + defaultDurationMs
      const cleanAvailableUntil =
        listingType !== 'sell' && availableUntil.trim() ? availableUntil.trim() : null

      if (cleanAvailableUntil) {
        const [y, m, d] = cleanAvailableUntil.split('-').map(Number)
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        const selectedEnd = new Date(y, m - 1, d, 23, 59, 59, 999)
        if (isNaN(selectedEnd.getTime()) || selectedEnd.getTime() < todayStart.getTime()) {
          setErrorMessage('Please choose today or a future date for "Available / Needed until".')
          return
        }
        // If user picked a date sooner than the default expiry, expire right after that date
        expiresAtMs = Math.min(expiresAtMs, selectedEnd.getTime())
      }

      const expiresAt = new Date(expiresAtMs).toISOString()

      const payload = {
        owner_id: userId,
        calculator_model: finalModel,
        type: listingType,
        price: parsedPrice,
        trust_rule: listingType === 'lend' ? trustRule : null,
        available_until: cleanAvailableUntil,
        contact_type: primaryContactType,
        contact_handle: primaryContactHandle,
        contacts,
        note: note.trim() || null,
        status: 'available',
        expires_at: expiresAt,
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
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <h3 className="font-medium">Listing Limit Reached (5/5)</h3>
              <p className="mt-1 text-xs sm:text-sm text-amber-200/80">
                You already have 5 active calculator listings. To post another, please mark a finished listing as done or delete an old one.
              </p>
              <div className="mt-3">
                <Link
                  href="/my-listings"
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-full bg-brand-green text-black transition-all duration-300"
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
        <div className="mb-4 flex items-center justify-between text-xs text-white/50 px-1">
          <span>Active listings limit:</span>
          <span className="font-medium text-brand-green">
            {activeListingCount} / 5 active
          </span>
        </div>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-6 p-3.5 rounded-2xl bg-red-500/10 border border-red-400/30 text-red-200 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success alert */}
      {success && (
        <div className="mb-6 p-3.5 rounded-2xl bg-brand-green/10 border border-brand-green/30 text-brand-green text-xs sm:text-sm flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-brand-green mt-0.5 flex-shrink-0" />
          <span>Listing created! Redirecting to your listings...</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-[#111612]/60 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/10"
      >
        {/* Field 1: Calculator Model */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-white mb-2">
            Calculator Model <span className="text-brand-green">*</span>
          </label>
          <div className="relative">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={isLimitReached || loading}
              className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-green/50 disabled:opacity-50"
              required
            >
              <option value="" className="bg-[#111612] text-white">Select calculator model...</option>
              {STANDARD_CALCULATOR_MODELS.map((m) => (
                <option key={m} value={m} className="bg-[#111612] text-white">
                  {m}
                </option>
              ))}
              <option value="Other" className="bg-[#111612] text-white">Other (specify below)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-white/40">
              <Calculator className="w-4 h-4" />
            </div>
          </div>

          {/* Conditional Free-Text Field if "Other" is chosen */}
          {model === 'Other' && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                Specify Model Name <span className="text-brand-green">*</span>
              </label>
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="e.g. fx-991CW, fx-991MS, Texas Instruments"
                maxLength={50}
                disabled={isLimitReached || loading}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-green/50 disabled:opacity-50"
                required
              />
            </div>
          )}
        </div>

        {/* Field 2: Lend / Sell / Request Toggle */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-white mb-2">
            What do you want to do? <span className="text-brand-green">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setListingType('lend')
                setPrice('')
              }}
              disabled={isLimitReached || loading}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                listingType === 'lend'
                  ? 'border-brand-green/50 bg-brand-green/10 text-white'
                  : 'border-white/10 hover:border-white/20 bg-white/5 text-white/70'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-medium text-xs sm:text-sm">Lend</span>
                <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded-full bg-brand-green text-black">
                  Free / ₹10+
                </span>
              </div>
              <p className="text-[11px] text-white/50 mt-1.5">
                Lend for exam or semester
              </p>
            </button>

            <button
              type="button"
              onClick={() => setListingType('sell')}
              disabled={isLimitReached || loading}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                listingType === 'sell'
                  ? 'border-brand-green/50 bg-brand-green/10 text-white'
                  : 'border-white/10 hover:border-white/20 bg-white/5 text-white/70'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-medium text-xs sm:text-sm">Sell</span>
                <Tag className="w-3.5 h-3.5 text-brand-green" />
              </div>
              <p className="text-[11px] text-white/50 mt-1.5">
                Sell permanently for cash
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setListingType('request')
                setPrice('')
              }}
              disabled={isLimitReached || loading}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                listingType === 'request'
                  ? 'border-amber-400/60 bg-amber-500/10 text-white'
                  : 'border-white/10 hover:border-white/20 bg-white/5 text-white/70'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-medium text-xs sm:text-sm">Request</span>
                <HandHelping className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-[11px] text-white/50 mt-1.5">
                Need one (24h or 7 days)
              </p>
            </button>
          </div>
        </div>

        {/* Field 3A: Lending Fee + Trust Rule (Only visible for Lend) */}
        {listingType === 'lend' && (
          <div className="space-y-4">
            {/* Lending Fee */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-white mb-2">
                Lending Fee <span className="text-brand-green">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    { id: 'free', label: 'Free' },
                    { id: '10', label: '₹10' },
                    { id: '20', label: '₹20' },
                    { id: 'custom', label: 'Custom' },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setLendFeeMode(option.id)}
                    disabled={isLimitReached || loading}
                    className={`py-2 px-3 rounded-full border text-xs font-medium cursor-pointer transition-all duration-200 ${
                      lendFeeMode === option.id
                        ? 'border-brand-green/60 bg-brand-green/15 text-brand-green'
                        : 'border-white/10 bg-white/5 text-white/65 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {lendFeeMode === 'custom' && (
                <div className="mt-2.5 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/40">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    step="1"
                    value={lendCustomPrice}
                    onChange={(e) => setLendCustomPrice(e.target.value)}
                    placeholder="Enter fee below ₹100 (e.g. 30)"
                    disabled={isLimitReached || loading}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-green/50 disabled:opacity-50"
                    required
                  />
                </div>
              )}
            </div>

            {/* Trust / Return Rule */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-white mb-2">
                Return Proof <span className="text-brand-green">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setTrustRule('id_proof')}
                  disabled={isLimitReached || loading}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 ${
                    trustRule === 'id_proof'
                      ? 'border-brand-green/60 bg-brand-green/10 text-white'
                      : 'border-white/10 bg-white/5 text-white/65 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-medium text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
                    <span>ID Card Photo + Phone</span>
                  </div>
                  <p className="text-[11px] text-white/50 mt-1">
                    Snap a photo of their college ID &amp; note phone number
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTrustRule('none')}
                  disabled={isLimitReached || loading}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 ${
                    trustRule === 'none'
                      ? 'border-brand-green/60 bg-brand-green/10 text-white'
                      : 'border-white/10 bg-white/5 text-white/65 hover:border-white/20'
                  }`}
                >
                  <div className="font-medium text-xs">No ID / Deposit Needed</div>
                  <p className="text-[11px] text-white/50 mt-1">
                    Direct handoff on trust
                  </p>
                </button>
              </div>
            </div>

            {/* Lender Safety Reminder */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/25 flex items-start gap-2.5 text-[11px] text-amber-200/90 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <span>
                Reminder: Please take a photograph of the borrower&apos;s college ID card and note their phone number if you don&apos;t know the person well.
              </span>
            </div>
          </div>
        )}

        {/* Field 3D: Available Until / Needed Until Date (For Lend & Request) */}
        {(listingType === 'lend' || listingType === 'request') && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-medium text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-green" />
                <span>
                  {listingType === 'lend' ? 'Available until' : 'Needed until'}{' '}
                  <span className="text-white/40 font-normal">(Optional)</span>
                </span>
              </label>
              {availableUntil && (
                <button
                  type="button"
                  onClick={() => setAvailableUntil('')}
                  className="text-[11px] text-white/50 hover:text-white cursor-pointer"
                >
                  Clear date
                </button>
              )}
            </div>
            <input
              type="date"
              value={availableUntil}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setAvailableUntil(e.target.value)}
              disabled={isLimitReached || loading}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-green/50 disabled:opacity-50 [color-scheme:dark]"
            />
            <p className="text-[11px] text-white/45 mt-1">
              {listingType === 'lend'
                ? 'Let borrowers know the last date you can lend it (e.g., before your own exams start).'
                : 'Let seniors know the last date you need the calculator.'}
            </p>
          </div>
        )}

        {/* Field 3B: Price in INR (Only visible and required for Sell) */}
        {listingType === 'sell' && (
          <div className="transition-all">
            <label className="block text-xs sm:text-sm font-medium text-white mb-1.5">
              Selling Price (INR) <span className="text-brand-green">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/40">
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
                className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-green/50 disabled:opacity-50"
                required={listingType === 'sell'}
              />
            </div>
            <p className="text-[11px] text-white/40 mt-1.5">
              Direct peer payment on handover (cash or UPI).
            </p>
          </div>
        )}

        {/* Field 3C: Request Duration + Optional Offer (Only visible for Request) */}
        {listingType === 'request' && (
          <div className="space-y-4">
            {/* Request Duration */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-white mb-2">
                How long should this request stay active? <span className="text-brand-green">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRequestDuration('24h')}
                  disabled={isLimitReached || loading}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 ${
                    requestDuration === '24h'
                      ? 'border-amber-400/60 bg-amber-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-white/65 hover:border-white/20'
                  }`}
                >
                  <div className="font-medium text-xs">24 Hours</div>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    Urgent exam / lab today
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRequestDuration('7d')}
                  disabled={isLimitReached || loading}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 ${
                    requestDuration === '7d'
                      ? 'border-amber-400/60 bg-amber-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-white/65 hover:border-white/20'
                  }`}
                >
                  <div className="font-medium text-xs">7 Days</div>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    Need one this week
                  </p>
                </button>
              </div>
            </div>

            {/* Optional Reward / Offer to Helper */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-white mb-1">
                Offer to Helper <span className="text-white/40 font-normal">(Optional)</span>
              </label>
              <p className="text-[11px] text-white/45 mb-2">
                Offering ₹10–₹20 motivates seniors with a spare calculator to help you faster.
              </p>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    { id: 'free', label: 'Free (₹0)' },
                    { id: '10', label: '₹10' },
                    { id: '20', label: '₹20' },
                    { id: 'custom', label: 'Custom' },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setRequestOfferMode(option.id)}
                    disabled={isLimitReached || loading}
                    className={`py-2 px-2.5 rounded-full border text-xs font-medium cursor-pointer transition-all duration-200 ${
                      requestOfferMode === option.id
                        ? 'border-amber-400/60 bg-amber-500/15 text-amber-300'
                        : 'border-white/10 bg-white/5 text-white/65 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {requestOfferMode === 'custom' && (
                <div className="mt-2.5 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/40">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    step="1"
                    value={requestCustomOffer}
                    onChange={(e) => setRequestCustomOffer(e.target.value)}
                    placeholder="Enter offer below ₹100 (e.g. 30)"
                    disabled={isLimitReached || loading}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 disabled:opacity-50"
                    required
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Field 4: Mandatory VVCE ID + At Least 1 Instant Contact Method */}
        <div className="space-y-3">
          {userEmail && (
            <div className="p-3 rounded-2xl border border-brand-green/25 bg-brand-green/5 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span className="text-white/90 truncate font-mono">{userEmail}</span>
              </div>
              <span className="text-[10px] text-brand-green font-medium flex-shrink-0">
                (Mandatory • Auto-filled)
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-medium text-white">
              Instant Contact Method <span className="text-brand-green">*</span>
            </label>
            <p className="text-[11px] text-white/45 mt-0.5">
              Select at least 1 fast messaging or call option (your VVCE ID is attached automatically).
            </p>
          </div>

          {/* Toggle Pills */}
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-brand-green' },
                { id: 'phone', label: 'Phone Call', icon: Phone, color: 'text-emerald-400' },
                { id: 'telegram', label: 'Telegram', icon: Send, color: 'text-sky-400' },
                { id: 'instagram', label: 'Instagram', icon: InstagramIcon, color: 'text-pink-400' },
                { id: 'discord', label: 'Discord', icon: DiscordIcon, color: 'text-indigo-400' },
              ] as const
            ).map(({ id, label, icon: Icon, color }) => {
              const active = enabledChannels[id]
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleChannel(id)}
                  disabled={isLimitReached || loading}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all duration-200 ${
                    active
                      ? 'border-brand-green/60 bg-brand-green/15 text-white'
                      : 'border-white/10 bg-white/5 text-white/55 hover:text-white hover:border-white/20'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <span>{label}</span>
                  {active && <Check className="w-3 h-3 text-brand-green" />}
                </button>
              )
            })}
          </div>

          {/* Inputs for Enabled Channels */}
          <div className="space-y-3 pt-1">
            {enabledChannels.whatsapp && (
              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1">
                  WhatsApp Number
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/40 text-xs font-mono">
                    +91
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={whatsappInput}
                    onChange={(e) => setWhatsappInput(e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={15}
                    disabled={isLimitReached || loading}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-green/50 disabled:opacity-50"
                  />
                </div>
              </div>
            )}

            {enabledChannels.phone && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-white/70">
                    Phone Number (For Calls)
                  </label>
                  {enabledChannels.whatsapp && normalizeIndianPhone(whatsappInput) && (
                    <button
                      type="button"
                      onClick={() => setPhoneInput(normalizeIndianPhone(whatsappInput) ?? '')}
                      className="text-[11px] text-brand-green hover:underline cursor-pointer"
                    >
                      Same as WhatsApp
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/40 text-xs font-mono">
                    +91
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={15}
                    disabled={isLimitReached || loading}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-green/50 disabled:opacity-50"
                  />
                </div>
              </div>
            )}

            {enabledChannels.telegram && (
              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1">
                  Telegram Username or Mobile Number
                </label>
                <input
                  type="text"
                  value={telegramInput}
                  onChange={(e) => setTelegramInput(e.target.value)}
                  placeholder="@username or 10-digit number"
                  maxLength={50}
                  disabled={isLimitReached || loading}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-green/50 disabled:opacity-50"
                />
              </div>
            )}

            {enabledChannels.instagram && (
              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1">
                  Instagram Username
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/40">
                    <span className="text-xs font-mono font-bold">@</span>
                  </div>
                  <input
                    type="text"
                    value={instagramInput}
                    onChange={(e) => setInstagramInput(e.target.value)}
                    placeholder="your_instagram_handle"
                    maxLength={55}
                    disabled={isLimitReached || loading}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 pl-9 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-green/50 disabled:opacity-50"
                  />
                </div>
                <p className="text-[11px] text-white/40 mt-1">
                  Tip: Check Instagram &ldquo;Message Requests&rdquo; for DMs from batchmates.
                </p>
              </div>
            )}

            {enabledChannels.discord && (
              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1">
                  Discord Username
                </label>
                <input
                  type="text"
                  value={discordInput}
                  onChange={(e) => setDiscordInput(e.target.value)}
                  placeholder="discord_username"
                  maxLength={55}
                  disabled={isLimitReached || loading}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-green/50 disabled:opacity-50"
                />
              </div>
            )}
          </div>
        </div>

        {/* Field 5: Optional Note */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs sm:text-sm font-medium text-white flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-white/40" />
              <span>Note (Optional)</span>
            </label>
            <span
              className={`text-[11px] font-mono ${
                note.length > 180 ? 'text-amber-400 font-bold' : 'text-white/40'
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
            placeholder={
              listingType === 'request'
                ? 'e.g., Need urgently 2:00 PM - 5:00 PM outside Mech Block for M3 internals.'
                : 'e.g., Has fresh battery and hard cover. Meet near library or mechanical block.'
            }
            disabled={isLimitReached || loading}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-green/50 disabled:opacity-50 resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLimitReached || loading}
          className="w-full py-3.5 px-6 rounded-full font-medium text-xs sm:text-sm bg-brand-green text-black shadow-[0_0_20px_rgba(214,248,102,0.2)] hover:shadow-[0_0_28px_rgba(214,248,102,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 group"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              <span>Posting listing...</span>
            </>
          ) : (
            <>
              <span>
                {listingType === 'request'
                  ? `Post Request (${requestDuration === '7d' ? '7 days' : '24h'})`
                  : 'Post Calculator'}
              </span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
