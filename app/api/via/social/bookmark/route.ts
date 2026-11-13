import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../../deso-api"

export const dynamic = "force-dynamic"

const ASSOCIATION_TYPE = "BOOKMARK"
const ASSOCIATION_VALUE = "SAVED"

function reply(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } })
}
function publicKey(value: unknown): value is string {
  return typeof value === "string" && value.length >= 40 && value.length <= 128 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(value)
}
function hash(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-fA-F]{64}$/.test(value)
}
function hex(value: unknown): value is string {
  return typeof value === "string" && value.length >= 2 && value.length <= 500_000 && value.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(value)
}
function feeRate() {
  const configured = Number(process.env.DESO_MIN_FEE_RATE_NANOS_PER_KB)
  return Number.isFinite(configured) && configured > 0 ? Math.trunc(configured) : 1000
}

export async function POST(request: Request) {
  let raw: unknown
  try { raw = await request.json() } catch { return reply({ ok: false, error: "INVALID_JSON" }, 400) }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return reply({ ok: false, error: "INVALID_REQUEST" }, 400)
  const body = raw as Record<string, unknown>
  const key = body.publicKey
  if (body.action === "query") {
    if (!publicKey(key)) return reply({ ok: false, error: "INVALID_PUBLIC_KEY" }, 400)
    const lastSeen = body.lastSeenAssociationID
    if (lastSeen !== undefined && !hash(lastSeen)) return reply({ ok: false, error: "INVALID_CURSOR" }, 400)
    try {
      const response = await fetchDeSo("post-associations/query", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          TransactorPublicKeyBase58Check: key,
          AssociationType: ASSOCIATION_TYPE, AssociationValue: ASSOCIATION_VALUE,
          Limit: 100, SortDescending: true, IncludePostEntry: true,
          ...(lastSeen ? { LastSeenAssociationID: lastSeen } : {}),
        }),
      })
      if (!response.ok) return reply({ ok: false, error: "DESO_QUERY_REJECTED" }, 502)
      return reply({ ok: true, result: await response.json() })
    } catch { return reply({ ok: false, error: "DESO_QUERY_UNAVAILABLE" }, 503) }
  }
  if (body.action === "prepare-create" || body.action === "prepare-delete") {
    if (!publicKey(key)) return reply({ ok: false, error: "INVALID_PUBLIC_KEY" }, 400)
    const create = body.action === "prepare-create"
    if (create && !hash(body.postHash)) return reply({ ok: false, error: "INVALID_POST_HASH" }, 400)
    if (!create && !hash(body.associationID)) return reply({ ok: false, error: "INVALID_ASSOCIATION_ID" }, 400)
    try {
      const response = await fetchDeSo(create ? "post-associations/create" : "post-associations/delete", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          TransactorPublicKeyBase58Check: key,
          ...(create ? { PostHashHex: body.postHash, AssociationType: ASSOCIATION_TYPE, AssociationValue: ASSOCIATION_VALUE } : { AssociationID: body.associationID }),
          MinFeeRateNanosPerKB: feeRate(), TransactionFees: [],
        }),
      })
      if (!response.ok) return reply({ ok: false, error: "DESO_PREPARE_REJECTED" }, 502)
      const result = await response.json() as Record<string, unknown>
      if (!hex(result.TransactionHex)) return reply({ ok: false, error: "INVALID_PREPARED_TRANSACTION" }, 502)
      return reply({ ok: true, transactionHex: result.TransactionHex, feeNanos: typeof result.FeeNanos === "number" ? result.FeeNanos : null })
    } catch { return reply({ ok: false, error: "DESO_PREPARE_UNAVAILABLE" }, 503) }
  }
  if (body.action === "submit") {
    if (!hex(body.signedTransactionHex)) return reply({ ok: false, error: "INVALID_SIGNED_TRANSACTION" }, 400)
    try {
      const response = await fetchDeSo("submit-transaction", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TransactionHex: body.signedTransactionHex }),
      })
      if (!response.ok) return reply({ ok: false, error: "DESO_SUBMIT_REJECTED" }, 502)
      return reply({ ok: true, transaction: await response.json() })
    } catch { return reply({ ok: false, error: "DESO_SUBMIT_UNAVAILABLE" }, 503) }
  }
  return reply({ ok: false, error: "INVALID_ACTION" }, 400)
}
