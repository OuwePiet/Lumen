import { NextResponse } from "next/server"
import {
  resolveServerListingCommercialTerm,
  type ViaListingFiatCurrency,
} from "../../../../lib/via/listing-commercial-terms-server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const noStore = { "Cache-Control": "no-store" }
const POST_HASH_RE = /^[0-9a-fA-F]{64}$/
const PUBLIC_KEY_RE = /^[1-9A-HJ-NP-Za-km-z]{20,100}$/

function readParam(url: URL, name: string): string | null {
  const value = url.searchParams.get(name)?.trim()
  return value ? value : null
}

function readCurrency(url: URL): ViaListingFiatCurrency | null {
  const value = readParam(url, "currency")
  return value === "EUR" || value === "USD" ? value : null
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const nftId = readParam(url, "nft")
  const sellerPublicKey = readParam(url, "seller")
  const currency = readCurrency(url)

  if (
    !nftId ||
    !POST_HASH_RE.test(nftId) ||
    !sellerPublicKey ||
    !PUBLIC_KEY_RE.test(sellerPublicKey) ||
    !currency
  ) {
    return NextResponse.json(
      { resolved: false, reason: "invalid-commercial-terms-request" },
      { status: 400, headers: noStore },
    )
  }

  const term = resolveServerListingCommercialTerm({
    nftId,
    sellerPublicKey,
    currency,
  })

  if (!term) {
    return NextResponse.json(
      {
        resolved: false,
        reason: "commercial-terms-unavailable",
        authoritative: false,
      },
      { status: 404, headers: noStore },
    )
  }

  return NextResponse.json(
    {
      resolved: true,
      authoritative: true,
      source: "via-server-listing-terms",
      term,
      paymentAuthorized: false,
    },
    { status: 200, headers: noStore },
  )
}
