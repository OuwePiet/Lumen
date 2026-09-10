import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../../deso-api"

export const dynamic = "force-dynamic"

const DEFAULT_MIN_FEE_RATE_NANOS_PER_KB = 1000

function noStore(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } })
}

function validPublicKey(value: unknown): value is string {
  return typeof value === "string" && value.length >= 40 && value.length <= 128 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(value)
}

function validHex(value: unknown): value is string {
  return typeof value === "string" && value.length >= 2 && value.length <= 500_000 && value.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(value)
}

export async function POST(request: Request) {
  let input: unknown
  try { input = await request.json() } catch { return noStore({ ok: false, error: "INVALID_JSON" }, 400) }
  if (!input || typeof input !== "object" || Array.isArray(input)) return noStore({ ok: false, error: "INVALID_REQUEST" }, 400)

  const body = input as Record<string, unknown>

  if (body.action === "prepare") {
    const followerPublicKey = body.followerPublicKey
    const followedPublicKey = body.followedPublicKey
    const isUnfollow = body.isUnfollow === true

    if (!validPublicKey(followerPublicKey)) return noStore({ ok: false, error: "INVALID_FOLLOWER_PUBLIC_KEY" }, 400)
    if (!validPublicKey(followedPublicKey)) return noStore({ ok: false, error: "INVALID_FOLLOWED_PUBLIC_KEY" }, 400)
    if (followerPublicKey === followedPublicKey) return noStore({ ok: false, error: "SELF_FOLLOW_NOT_ALLOWED" }, 400)

    const configuredRate = Number(process.env.DESO_MIN_FEE_RATE_NANOS_PER_KB)
    const minFeeRate = Number.isFinite(configuredRate) && configuredRate > 0 ? Math.trunc(configuredRate) : DEFAULT_MIN_FEE_RATE_NANOS_PER_KB

    try {
      const response = await fetchDeSo("create-follow-txn-stateless", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          FollowerPublicKeyBase58Check: followerPublicKey,
          FollowedPublicKeyBase58Check: followedPublicKey,
          IsUnfollow: isUnfollow,
          MinFeeRateNanosPerKB: minFeeRate,
          TransactionFees: [],
        }),
      })
      if (!response.ok) return noStore({ ok: false, error: "DESO_PREPARE_REJECTED" }, 502)
      const data = await response.json() as Record<string, unknown>
      const transactionHex = data.TransactionHex
      const feeNanos = data.FeeNanos
      if (!validHex(transactionHex)) return noStore({ ok: false, error: "INVALID_PREPARED_TRANSACTION" }, 502)
      return noStore({ ok: true, transactionHex, feeNanos: typeof feeNanos === "number" && Number.isFinite(feeNanos) ? feeNanos : null })
    } catch {
      return noStore({ ok: false, error: "DESO_PREPARE_UNAVAILABLE" }, 503)
    }
  }

  if (body.action === "submit") {
    const signedTransactionHex = body.signedTransactionHex
    if (!validHex(signedTransactionHex)) return noStore({ ok: false, error: "INVALID_SIGNED_TRANSACTION" }, 400)
    try {
      const response = await fetchDeSo("submit-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TransactionHex: signedTransactionHex }),
      })
      if (!response.ok) return noStore({ ok: false, error: "DESO_SUBMIT_REJECTED" }, 502)
      return noStore({ ok: true, transaction: await response.json() })
    } catch {
      return noStore({ ok: false, error: "DESO_SUBMIT_UNAVAILABLE" }, 503)
    }
  }

  return noStore({ ok: false, error: "INVALID_ACTION" }, 400)
}
