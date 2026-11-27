'use client'

import { useState } from 'react'
import {
  Listing,
  getListingContacts,
  getWhatsAppUrl,
  getTelegramUrl,
  normalizeIndianPhone,
  copyToClipboard,
} from '@/utils/listings'
import { InstagramIcon, DiscordIcon } from '@/components/icons'
import {
  MessageCircle,
  Phone,
  Mail,
  Send,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react'

interface ContactActionsProps {
  listing: Listing
}

export function ContactActions({ listing }: ContactActionsProps) {
  const [copiedDiscord, setCopiedDiscord] = useState(false)
  const contacts = getListingContacts(listing)

  const handleCopyDiscord = async (handle: string) => {
    const success = await copyToClipboard(handle)
    if (success) {
      setCopiedDiscord(true)
      setTimeout(() => setCopiedDiscord(false), 2000)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {contacts.whatsapp && (
        <a
          href={getWhatsAppUrl(
            contacts.whatsapp,
            listing.calculator_model,
            listing.type,
            listing.price
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-green/15 hover:bg-brand-green/25 text-brand-green border border-brand-green/35 text-xs font-medium transition-colors duration-200"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </a>
      )}

      {contacts.phone && (
        <a
          href={`tel:+91${normalizeIndianPhone(contacts.phone) ?? contacts.phone.replace(/\D/g, '')}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 text-xs font-medium transition-colors duration-200"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Call</span>
        </a>
      )}

      {contacts.telegram && (
        <a
          href={getTelegramUrl(contacts.telegram)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 text-xs font-medium transition-colors duration-200"
        >
          <Send className="w-3.5 h-3.5 text-sky-400" />
          <span>Telegram</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
      )}

      {contacts.email && (
        <a
          href={`mailto:${encodeURIComponent(contacts.email)}?subject=${encodeURIComponent(
            `CalciShare: ${listing.calculator_model}`
          )}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 text-xs font-medium transition-colors duration-200 max-w-full"
          title={contacts.email}
        >
          <Mail className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
          <span className="truncate max-w-[180px]">{contacts.email}</span>
        </a>
      )}

      {contacts.instagram && (() => {
        const sanitized = contacts.instagram
          .replace(/^@+/, '')
          .replace(/[^a-zA-Z0-9._-]/g, '')
        return (
          <a
            href={`https://instagram.com/${encodeURIComponent(sanitized)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 text-xs font-medium transition-colors duration-200"
          >
            <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
            <span>@{sanitized}</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        )
      })()}

      {contacts.discord && (
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 text-white/90 border border-white/10 text-xs font-medium">
          <DiscordIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-mono">{contacts.discord}</span>
          <button
            type="button"
            onClick={() => handleCopyDiscord(contacts.discord!)}
            className="ml-0.5 p-0.5 hover:text-brand-green rounded cursor-pointer transition-colors"
            title="Copy Discord handle"
          >
            {copiedDiscord ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-green">
                <Check className="w-3 h-3" />
                Copied!
              </span>
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      )}
    </div>
  )
}
