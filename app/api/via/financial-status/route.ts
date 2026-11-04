import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../deso-api"

export const dynamic = "force-dynamic"
export async function GET(request: Request) {
  const hash = new URL(request.url).searchParams.get("hash") ?? ""
  const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } })
  if (!/^[0-9a-f]{64}$/i.test(hash)) return json({ ok: false, error: "INVALID_TRANSACTION_HASH" }, 400)
  try {
    // Official SDK 3.4.1 getTransaction contract: read-only POST get-txn.
    const response = await fetchDeSo("get-txn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ TxnHashHex: hash.toLowerCase() }), cache: "no-store" })
    if (!response.ok) return json({ ok: false, error: "TRANSACTION_READ_UNAVAILABLE" }, 503)
    const data = await response.json() as { TxnFound?: unknown }
    if (typeof data.TxnFound !== "boolean") return json({ ok: false, error: "INVALID_TRANSACTION_READ" }, 503)
    return json({ ok: true, found: data.TxnFound })
  } catch { return json({ ok: false, error: "TRANSACTION_READ_UNAVAILABLE" }, 503) }
}
