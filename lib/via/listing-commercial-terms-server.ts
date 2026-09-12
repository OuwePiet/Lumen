export type ViaListingFiatCurrency = "EUR" | "USD"

export type ViaListingCommercialTerm = {
  nftId: string
  sellerPublicKey: string
  currency: ViaListingFiatCurrency
  amountMinor: number
}

const POST_HASH_RE = /^[0-9a-fA-F]{64}$/
const PUBLIC_KEY_RE = /^[1-9A-HJ-NP-Za-km-z]{20,100}$/

function isCommercialTerm(value: unknown): value is ViaListingCommercialTerm {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false

  const term = value as Record<string, unknown>
  if (typeof term.nftId !== "string" || !POST_HASH_RE.test(term.nftId)) return false
  if (
    typeof term.sellerPublicKey !== "string" ||
    !PUBLIC_KEY_RE.test(term.sellerPublicKey)
  ) {
    return false
  }
  if (term.currency !== "EUR" && term.currency !== "USD") return false
  return Number.isSafeInteger(term.amountMinor) && Number(term.amountMinor) > 0
}

function configuredTerms(): readonly ViaListingCommercialTerm[] {
  const raw = process.env.VIA_LISTING_COMMERCIAL_TERMS_JSON?.trim()
  if (!raw) return []

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter(isCommercialTerm)
      .map((term) => ({
        nftId: term.nftId.toLowerCase(),
        sellerPublicKey: term.sellerPublicKey,
        currency: term.currency,
        amountMinor: term.amountMinor,
      }))
  } catch {
    return []
  }
}

export function resolveServerListingCommercialTerm(input: {
  nftId: string
  sellerPublicKey: string
  currency: ViaListingFiatCurrency
}): ViaListingCommercialTerm | null {
  const nftId = input.nftId.toLowerCase()

  return (
    configuredTerms().find(
      (term) =>
        term.nftId === nftId &&
        term.sellerPublicKey === input.sellerPublicKey &&
        term.currency === input.currency,
    ) ?? null
  )
}

export const VIA_LISTING_COMMERCIAL_TERMS_RULES = {
  serverOnly:
    "Authoritative fiat listing terms are read only from server configuration, never from browser-supplied amounts.",
  explicitCurrency:
    "Only explicit EUR or USD terms are accepted. DeSo nanos are never silently converted into fiat.",
  failClosed:
    "Missing, malformed or unmatched server terms produce no authoritative commercial term.",
  noPayment:
    "Resolving a commercial term does not create a charge, provider session, settlement, NFT transfer or blockchain write.",
} as const
