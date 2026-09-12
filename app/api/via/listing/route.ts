import { NextResponse } from "next/server"
import { resolveDeSoListingEvidence } from "../../../../lib/via/deso-listing-server"

export const dynamic = "force-dynamic"

const noStore = { "Cache-Control": "no-store" }
const POST_HASH_RE = /^[0-9a-fA-F]{64}$/
const PUBLIC_KEY_RE = /^[1-9A-HJ-NP-Za-km-z]{20,100}$/

function readParam(url: URL, name: string): string | null {
  const value = url.searchParams.get(name)?.trim()
  return value ? value : null
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const sellerPublicKey = readParam(url, "seller")
  const nftId = readParam(url, "nft")

  if (!sellerPublicKey || !PUBLIC_KEY_RE.test(sellerPublicKey) || !nftId || !POST_HASH_RE.test(nftId)) {
    return NextResponse.json(
      { resolved: false, reason: "invalid-listing-request" },
      { status: 400, headers: noStore },
    )
  }

  try {
    const listing = await resolveDeSoListingEvidence({
      nftId,
      sellerPublicKey,
    })

    if (!listing) {
      return NextResponse.json(
        { resolved: false, reason: "nft-not-found-for-seller" },
        { status: 404, headers: noStore },
      )
    }

    return NextResponse.json(
      {
        resolved: true,
        source: "deso-get-nfts-for-user",
        listing,
        commercialAuthority: {
          desoNanosOnly: true,
          fiatTermsAvailable: false,
          authorizesCheckout: false,
        },
      },
      { status: 200, headers: noStore },
    )
  } catch {
    return NextResponse.json(
      { resolved: false, reason: "deso-listing-source-unavailable" },
      { status: 503, headers: noStore },
    )
  }
}
