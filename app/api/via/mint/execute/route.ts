import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../../deso-api"
import { validateMintPreflightInput } from "../../../../../lib/via/mint-preflight"

export const dynamic = "force-dynamic"

const DEFAULT_MIN_FEE_RATE_NANOS_PER_KB = 1000

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } })
}

function validHex(value: unknown): value is string {
  return typeof value === "string" && value.length >= 2 && value.length <= 500_000 && value.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(value)
}

export async function POST(request: Request) {
  let input: unknown
  try { input = await request.json() } catch { return json({ ok: false, error: "INVALID_JSON" }, 400) }
  if (!input || typeof input !== "object" || Array.isArray(input)) return json({ ok: false, error: "INVALID_REQUEST" }, 400)
  const body = input as Record<string, unknown>

  if (body.action === "prepare") {
    const mint = validateMintPreflightInput(body.mint)
    if (!mint) return json({ ok: false, error: "INVALID_MINT_REQUEST" }, 400)

    const configuredRate = Number(process.env.DESO_MIN_FEE_RATE_NANOS_PER_KB)
    const minFeeRate = Number.isFinite(configuredRate) && configuredRate > 0 ? Math.trunc(configuredRate) : DEFAULT_MIN_FEE_RATE_NANOS_PER_KB

    try {
      const response = await fetchDeSo("create-nft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UpdaterPublicKeyBase58Check: mint.updaterPublicKey,
          NFTPostHashHex: mint.nftPostHashHex,
          NumCopies: mint.numCopies,
          HasUnlockable: mint.hasUnlockable,
          IsForSale: mint.isForSale,
          MinBidAmountNanos: mint.minBidAmountNanos,
          NFTRoyaltyToCreatorBasisPoints: mint.creatorRoyaltyBasisPoints,
          NFTRoyaltyToCoinBasisPoints: mint.coinRoyaltyBasisPoints,
          IsBuyNow: mint.isBuyNow,
          BuyNowPriceNanos: mint.buyNowPriceNanos,
          AdditionalDESORoyaltiesMap: {},
          AdditionalCoinRoyaltiesMap: {},
          MinFeeRateNanosPerKB: minFeeRate,
          TransactionFees: [],
        }),
      })
      if (!response.ok) return json({ ok: false, error: "DESO_MINT_PREPARE_REJECTED" }, 502)
      const data = await response.json() as Record<string, unknown>
      if (!validHex(data.TransactionHex)) return json({ ok: false, error: "INVALID_PREPARED_TRANSACTION" }, 502)
      return json({
        ok: true,
        transactionHex: data.TransactionHex,
        feeNanos: typeof data.FeeNanos === "number" && Number.isFinite(data.FeeNanos) ? data.FeeNanos : null,
        spendAmountNanos: typeof data.SpendAmountNanos === "number" && Number.isFinite(data.SpendAmountNanos) ? data.SpendAmountNanos : null,
      })
    } catch {
      return json({ ok: false, error: "DESO_MINT_PREPARE_UNAVAILABLE" }, 503)
    }
  }

  if (body.action === "submit") {
    if (!validHex(body.signedTransactionHex)) return json({ ok: false, error: "INVALID_SIGNED_TRANSACTION" }, 400)
    try {
      const response = await fetchDeSo("submit-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TransactionHex: body.signedTransactionHex }),
      })
      if (!response.ok) return json({ ok: false, error: "DESO_MINT_SUBMIT_REJECTED" }, 502)
      return json({ ok: true, transaction: await response.json() as Record<string, unknown> })
    } catch {
      return json({ ok: false, error: "DESO_MINT_SUBMIT_UNAVAILABLE" }, 503)
    }
  }

  return json({ ok: false, error: "INVALID_ACTION" }, 400)
}
