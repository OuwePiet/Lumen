import { NextResponse } from "next/server"

const DEFAULT_DESO_NODE = "https://node.deso.org"
const POLL_ASSOCIATION_TYPE = "POLL_RESPONSE"
const DEFAULT_MIN_FEE_RATE_NANOS_PER_KB = 1000
const MAX_OPTION_LENGTH = 160

function noStore(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } })
}

function desoNode() {
  const raw = (process.env.DESO_NODE || DEFAULT_DESO_NODE).trim().replace(/\/$/, "")
  try {
    const url = new URL(raw)
    return url.protocol === "https:" ? url.toString().replace(/\/$/, "") : DEFAULT_DESO_NODE
  } catch {
    return DEFAULT_DESO_NODE
  }
}

function validPublicKey(value: unknown): value is string {
  return typeof value === "string"
    && value.length >= 40
    && value.length <= 80
    && /^[1-9A-HJ-NP-Za-km-z]+$/.test(value)
}

function validPostHash(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-fA-F]{64}$/.test(value)
}

function validHex(value: unknown): value is string {
  return typeof value === "string"
    && value.length >= 2
    && value.length <= 500_000
    && value.length % 2 === 0
    && /^[0-9a-fA-F]+$/.test(value)
}

async function existingResponses(postHash: string, voterPublicKey: string) {
  const response = await fetch(`${desoNode()}/api/v0/post-associations/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      PostHashHex: postHash,
      TransactorPublicKeyBase58Check: voterPublicKey,
      AssociationType: POLL_ASSOCIATION_TYPE,
      Limit: 2,
      SortDescending: true,
      IncludeTransactorProfile: false,
      IncludePostEntry: false,
      IncludePostAuthorProfile: false,
      IncludeAppProfile: false,
    }),
  })

  if (!response.ok) throw new Error("POLL_DUPLICATE_CHECK_REJECTED")
  const data = await response.json() as { Associations?: unknown }
  return Array.isArray(data.Associations) ? data.Associations.length : 0
}

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  let input: unknown
  try {
    input = await request.json()
  } catch {
    return noStore({ ok: false, error: "INVALID_JSON" }, 400)
  }

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return noStore({ ok: false, error: "INVALID_REQUEST" }, 400)
  }

  const body = input as Record<string, unknown>
  const action = body.action

  if (action === "prepare") {
    const voterPublicKey = body.voterPublicKey
    const postHash = body.postHash
    const option = typeof body.option === "string" ? body.option.trim() : ""

    if (!validPublicKey(voterPublicKey)) return noStore({ ok: false, error: "INVALID_VOTER_PUBLIC_KEY" }, 400)
    if (!validPostHash(postHash)) return noStore({ ok: false, error: "INVALID_POST_HASH" }, 400)
    if (!option || option.length > MAX_OPTION_LENGTH || option.includes("\u0000")) {
      return noStore({ ok: false, error: "INVALID_POLL_OPTION" }, 400)
    }

    try {
      const priorResponses = await existingResponses(postHash, voterPublicKey)
      if (priorResponses > 0) {
        return noStore({
          ok: false,
          error: priorResponses > 1 ? "MULTIPLE_EXISTING_POLL_RESPONSES" : "POLL_RESPONSE_ALREADY_EXISTS",
        }, 409)
      }

      const configuredRate = Number(process.env.DESO_MIN_FEE_RATE_NANOS_PER_KB)
      const minFeeRate = Number.isFinite(configuredRate) && configuredRate > 0
        ? Math.trunc(configuredRate)
        : DEFAULT_MIN_FEE_RATE_NANOS_PER_KB

      const response = await fetch(`${desoNode()}/api/v0/post-associations/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          TransactorPublicKeyBase58Check: voterPublicKey,
          PostHashHex: postHash,
          AppPublicKeyBase58Check: "",
          AssociationType: POLL_ASSOCIATION_TYPE,
          AssociationValue: option,
          ExtraData: { ViaClient: "viadeso.online" },
          MinFeeRateNanosPerKB: minFeeRate,
          TransactionFees: [],
        }),
      })

      if (!response.ok) return noStore({ ok: false, error: "DESO_POLL_PREPARE_REJECTED" }, 502)
      const data = await response.json() as Record<string, unknown>
      if (!validHex(data.TransactionHex)) return noStore({ ok: false, error: "INVALID_PREPARED_TRANSACTION" }, 502)

      return noStore({
        ok: true,
        transactionHex: data.TransactionHex,
        feeNanos: typeof data.FeeNanos === "number" && Number.isFinite(data.FeeNanos) ? data.FeeNanos : null,
        spendAmountNanos: typeof data.SpendAmountNanos === "number" && Number.isFinite(data.SpendAmountNanos) ? data.SpendAmountNanos : null,
        associationType: POLL_ASSOCIATION_TYPE,
        option,
        duplicateGuard: "via-interface",
      })
    } catch {
      return noStore({ ok: false, error: "POLL_PREPARE_UNAVAILABLE" }, 503)
    }
  }

  if (action === "submit") {
    const signedTransactionHex = body.signedTransactionHex
    if (!validHex(signedTransactionHex)) return noStore({ ok: false, error: "INVALID_SIGNED_TRANSACTION" }, 400)

    try {
      const response = await fetch(`${desoNode()}/api/v0/submit-transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ TransactionHex: signedTransactionHex }),
      })
      if (!response.ok) return noStore({ ok: false, error: "DESO_POLL_SUBMIT_REJECTED" }, 502)
      return noStore({ ok: true, transaction: await response.json() as Record<string, unknown> })
    } catch {
      return noStore({ ok: false, error: "DESO_POLL_SUBMIT_UNAVAILABLE" }, 503)
    }
  }

  return noStore({ ok: false, error: "INVALID_ACTION" }, 400)
}
