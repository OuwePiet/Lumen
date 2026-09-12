import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../../deso-api"
import { validateMintPreflightInput } from "../../../../../lib/via/mint-preflight"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const noStore = { "Cache-Control": "no-store" }

function safeIntegerField(value: unknown) {
  return Number.isSafeInteger(value) && Number(value) >= 0 ? Number(value) : null
}

export async function POST(request: Request) {
  try {
    const raw: unknown = await request.json()
    const input = validateMintPreflightInput(raw)
    if (!input) {
      return NextResponse.json(
        { resolved: false, reason: "invalid-mint-request", mintAuthorized: false },
        { status: 400, headers: noStore },
      )
    }

    const response = await fetchDeSo("create-nft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        UpdaterPublicKeyBase58Check: input.updaterPublicKey,
        NFTPostHashHex: input.nftPostHashHex,
        NumCopies: input.numCopies,
        HasUnlockable: input.hasUnlockable,
        IsForSale: input.isForSale,
        MinBidAmountNanos: input.minBidAmountNanos,
        NFTRoyaltyToCreatorBasisPoints: input.creatorRoyaltyBasisPoints,
        NFTRoyaltyToCoinBasisPoints: input.coinRoyaltyBasisPoints,
        IsBuyNow: input.isBuyNow,
        BuyNowPriceNanos: input.buyNowPriceNanos,
        AdditionalDESORoyaltiesMap: {},
        AdditionalCoinRoyaltiesMap: {},
        MinFeeRateNanosPerKB: 0,
        TransactionFees: [],
      }),
    })

    const data: unknown = await response.json().catch(() => null)
    if (!response.ok || !data || typeof data !== "object" || Array.isArray(data)) {
      return NextResponse.json(
        { resolved: false, reason: "deso-mint-preflight-unavailable", mintAuthorized: false },
        { status: response.status >= 400 && response.status < 500 ? 409 : 503, headers: noStore },
      )
    }

    const result = data as Record<string, unknown>
    const feeNanos = safeIntegerField(result.FeeNanos)
    const spendAmountNanos = safeIntegerField(result.SpendAmountNanos)
    const totalInputNanos = safeIntegerField(result.TotalInputNanos)
    const changeAmountNanos = safeIntegerField(result.ChangeAmountNanos)

    if (feeNanos === null) {
      return NextResponse.json(
        { resolved: false, reason: "deso-mint-fee-unresolved", mintAuthorized: false },
        { status: 503, headers: noStore },
      )
    }

    return NextResponse.json(
      {
        resolved: true,
        source: "deso-create-nft-constructor",
        quotedAt: new Date().toISOString(),
        quote: {
          feeNanos,
          spendAmountNanos,
          totalInputNanos,
          changeAmountNanos,
          viaServiceFeeNanos: 0,
        },
        mint: {
          nftPostHashHex: input.nftPostHashHex,
          numCopies: input.numCopies,
          hasUnlockable: input.hasUnlockable,
          isForSale: input.isForSale,
          minBidAmountNanos: input.minBidAmountNanos,
          creatorRoyaltyBasisPoints: input.creatorRoyaltyBasisPoints,
          coinRoyaltyBasisPoints: input.coinRoyaltyBasisPoints,
          isBuyNow: input.isBuyNow,
          buyNowPriceNanos: input.buyNowPriceNanos,
        },
        unsignedTransactionConstructed: true,
        quoteId: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        quotedForPublicKey: input.updaterPublicKey,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        transactionHexExposed: false,
        mintAuthorized: false,
        paymentAuthorized: false,
      },
      { status: 200, headers: noStore },
    )
  } catch {
    return NextResponse.json(
      { resolved: false, reason: "invalid-mint-request", mintAuthorized: false },
      { status: 400, headers: noStore },
    )
  }
}
