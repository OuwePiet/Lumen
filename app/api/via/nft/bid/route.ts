import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../../deso-api"

export const dynamic = "force-dynamic"

const DEFAULT_MIN_FEE_RATE_NANOS_PER_KB = 1000

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } })
}

function validPublicKey(value: unknown): value is string {
  return typeof value === "string" && value.length >= 40 && value.length <= 128 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(value)
}

function validPostHash(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-fA-F]{64}$/.test(value)
}

function validHex(value: unknown): value is string {
  return typeof value === "string" && value.length >= 2 && value.length <= 500_000 && value.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(value)
}

function validPositiveSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0
}

export async function POST(request: Request) {
  let input: unknown
  try { input = await request.json() } catch { return json({ ok: false, error: "INVALID_JSON" }, 400) }
  if (!input || typeof input !== "object" || Array.isArray(input)) return json({ ok: false, error: "INVALID_REQUEST" }, 400)

  const body = input as Record<string, unknown>

  if (body.action === "prepare") {
    const publicKey = body.publicKey
    const postHash = body.postHash
    const serialNumber = body.serialNumber
    const bidAmountNanos = body.bidAmountNanos

    if (!validPublicKey(publicKey)) return json({ ok: false, error: "INVALID_PUBLIC_KEY" }, 400)
    if (!validPostHash(postHash)) return json({ ok: false, error: "INVALID_POST_HASH" }, 400)
    if (!validPositiveSafeInteger(serialNumber)) return json({ ok: false, error: "INVALID_SERIAL_NUMBER" }, 400)
    if (!validPositiveSafeInteger(bidAmountNanos)) return json({ ok: false, error: "INVALID_BID_AMOUNT" }, 400)

    const configuredRate = Number(process.env.DESO_MIN_FEE_RATE_NANOS_PER_KB)
    const minFeeRate = Number.isFinite(configuredRate) && configuredRate > 0 ? Math.trunc(configuredRate) : DEFAULT_MIN_FEE_RATE_NANOS_PER_KB

    try {
      const response = await fetchDeSo("create-nft-bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UpdaterPublicKeyBase58Check: publicKey,
          NFTPostHashHex: postHash.toLowerCase(),
          SerialNumber: serialNumber,
          BidAmountNanos: bidAmountNanos,
          MinFeeRateNanosPerKB: minFeeRate,
          TransactionFees: [],
        }),
      })
      if (!response.ok) return json({ ok: false, error: "DESO_NFT_BID_PREPARE_REJECTED" }, 502)
      const data = await response.json() as Record<string, unknown>
      if (!validHex(data.TransactionHex)) return json({ ok: false, error: "INVALID_PREPARED_TRANSACTION" }, 502)
      return json({
        ok: true,
        transactionHex: data.TransactionHex,
        feeNanos: typeof data.FeeNanos === "number" && Number.isFinite(data.FeeNanos) ? data.FeeNanos : null,
        spendAmountNanos: typeof data.SpendAmountNanos === "number" && Number.isFinite(data.SpendAmountNanos) ? data.SpendAmountNanos : bidAmountNanos,
      })
    } catch {
      return json({ ok: false, error: "DESO_NFT_BID_PREPARE_UNAVAILABLE" }, 503)
    }
  }

  if (body.action === "submit") {
    const signedTransactionHex = body.signedTransactionHex
    if (!validHex(signedTransactionHex)) return json({ ok: false, error: "INVALID_SIGNED_TRANSACTION" }, 400)
    try {
      const response = await fetchDeSo("submit-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TransactionHex: signedTransactionHex }),
      })
      if (!response.ok) return json({ ok: false, error: "DESO_NFT_BID_SUBMIT_REJECTED" }, 502)
      return json({ ok: true, transaction: await response.json() as Record<string, unknown> })
    } catch {
      return json({ ok: false, error: "DESO_NFT_BID_SUBMIT_UNAVAILABLE" }, 503)
    }
  }

  return json({ ok: false, error: "INVALID_ACTION" }, 400)
}
