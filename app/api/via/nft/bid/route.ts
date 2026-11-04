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
    const buyNow = body.buyNow === true
    const expectedOwnerPublicKey = body.expectedOwnerPublicKey

    if (!validPublicKey(publicKey)) return json({ ok: false, error: "INVALID_PUBLIC_KEY" }, 400)
    if (!validPostHash(postHash)) return json({ ok: false, error: "INVALID_POST_HASH" }, 400)
    if (!validPositiveSafeInteger(serialNumber)) return json({ ok: false, error: "INVALID_SERIAL_NUMBER" }, 400)
    if (!validPositiveSafeInteger(bidAmountNanos)) return json({ ok: false, error: "INVALID_BID_AMOUNT" }, 400)
    if (typeof body.buyNow !== "boolean" || !validPublicKey(expectedOwnerPublicKey)) return json({ ok: false, error: "INVALID_BID_INTENT" }, 400)

    const configuredRate = Number(process.env.DESO_MIN_FEE_RATE_NANOS_PER_KB)
    const minFeeRate = Number.isFinite(configuredRate) && configuredRate > 0 ? Math.trunc(configuredRate) : DEFAULT_MIN_FEE_RATE_NANOS_PER_KB

    try {
      // Revalidate current listing and exact sender balance before constructing.
      // These official endpoints only read state; they never sign or submit.
      const [entryResponse, balanceResponse] = await Promise.all([
        fetchDeSo("get-nft-entries-for-nft-post", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ PostHashHex: postHash }), cache: "no-store" }),
        fetchDeSo("get-users-stateless", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ PublicKeysBase58Check: [publicKey], SkipForLeaderboard: true, GetUnminedBalance: true }), cache: "no-store" }),
      ])
      if (!entryResponse.ok || !balanceResponse.ok) return json({ ok: false, error: "NFT_PREFLIGHT_UNAVAILABLE" }, 503)
      const entries = await entryResponse.json() as { NFTEntryResponses?: Array<{ SerialNumber?: unknown; OwnerPublicKeyBase58Check?: unknown; IsForSale?: unknown; IsPending?: unknown; IsBuyNow?: unknown; BuyNowPriceNanos?: unknown; MinBidAmountNanos?: unknown }> }
      const users = await balanceResponse.json() as { UserList?: Array<{ PublicKeyBase58Check?: unknown; BalanceNanos?: unknown }> }
      const entry = Array.isArray(entries.NFTEntryResponses) ? entries.NFTEntryResponses.find((item) => item.SerialNumber === serialNumber) : undefined
      const user = Array.isArray(users.UserList) ? users.UserList.find((item) => item.PublicKeyBase58Check === publicKey) : undefined
      if (!entry || entry.IsForSale !== true || entry.IsPending !== false || entry.OwnerPublicKeyBase58Check !== expectedOwnerPublicKey || entry.OwnerPublicKeyBase58Check === publicKey ||
        typeof entry.MinBidAmountNanos !== "number" || !Number.isSafeInteger(entry.MinBidAmountNanos) || entry.MinBidAmountNanos < 0 || bidAmountNanos < entry.MinBidAmountNanos ||
        (buyNow && (entry.IsBuyNow !== true || entry.BuyNowPriceNanos !== bidAmountNanos))) return json({ ok: false, error: "NFT_LISTING_CHANGED_REVIEW_AGAIN" }, 409)
      const balanceNanos = user?.BalanceNanos
      if (typeof balanceNanos !== "number" || !Number.isSafeInteger(balanceNanos) || balanceNanos < 0) return json({ ok: false, error: "INVALID_SENDER_BALANCE" }, 503)
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
      const feeNanos = data.FeeNanos
      const spendAmountNanos = data.SpendAmountNanos
      if (typeof feeNanos !== "number" || !Number.isSafeInteger(feeNanos) || feeNanos < 0 ||
        typeof spendAmountNanos !== "number" || !Number.isSafeInteger(spendAmountNanos) || spendAmountNanos < 0) return json({ ok: false, error: "INVALID_PREPARED_COST" }, 502)
      // SDK createNFTBid budgets bid + fee, even if a standing bid spends no
      // principal immediately. Never under-budget a larger node-reported spend.
      const requiredNanos = Math.max(bidAmountNanos, spendAmountNanos) + feeNanos
      if (!Number.isSafeInteger(requiredNanos) || requiredNanos > balanceNanos) return json({ ok: false, error: "INSUFFICIENT_DESO_BALANCE" }, 409)
      return json({
        ok: true,
        transactionHex: data.TransactionHex,
        publicKey, postHash: postHash.toLowerCase(), serialNumber, bidAmountNanos,
        feeNanos, spendAmountNanos, balanceNanos, preparedAt: Date.now(),
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
