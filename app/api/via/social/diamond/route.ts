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

function validPostHash(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-fA-F]{64}$/.test(value)
}

function validHex(value: unknown): value is string {
  return typeof value === "string" && value.length >= 2 && value.length <= 500_000 && value.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(value)
}

export async function POST(request: Request) {
  let input: unknown
  try { input = await request.json() } catch { return noStore({ ok: false, error: "INVALID_JSON" }, 400) }
  if (!input || typeof input !== "object" || Array.isArray(input)) return noStore({ ok: false, error: "INVALID_REQUEST" }, 400)

  const body = input as Record<string, unknown>

  if (body.action === "levels") {
    try {
      const response = await fetchDeSo("get-app-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (!response.ok) return noStore({ ok: false, error: "DIAMOND_LEVELS_UNAVAILABLE" }, 502)
      const data = await response.json() as Record<string, unknown>
      const rawMap = data.DiamondLevelMap
      if (!rawMap || typeof rawMap !== "object" || Array.isArray(rawMap)) return noStore({ ok: false, error: "INVALID_DIAMOND_LEVELS" }, 502)
      const diamondLevelMap = Object.fromEntries(
        Object.entries(rawMap as Record<string, unknown>)
          .filter(([key, value]) => /^\d+$/.test(key) && typeof value === "number" && Number.isFinite(value) && value > 0)
          .map(([key, value]) => [key, Math.trunc(value as number)])
      )
      if (Object.keys(diamondLevelMap).length === 0) return noStore({ ok: false, error: "INVALID_DIAMOND_LEVELS" }, 502)
      return noStore({ ok: true, diamondLevelMap })
    } catch {
      return noStore({ ok: false, error: "DIAMOND_LEVELS_UNAVAILABLE" }, 503)
    }
  }

  if (body.action === "received-levels") {
    if (!validPostHash(body.postHash)) return noStore({ ok: false, error: "INVALID_POST_HASH" }, 400)
    try {
      const levels: number[] = []
      const limit = 100
      for (let offset = 0; offset < 1000; offset += limit) {
        const response = await fetchDeSo("get-diamonds-for-post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ PostHashHex: body.postHash, Offset: offset, Limit: limit }),
        })
        if (!response.ok) break
        const data = await response.json() as { DiamondSenders?: { DiamondLevel?: number }[] | null }
        const senders = data.DiamondSenders ?? []
        const page = senders.map(sender => sender?.DiamondLevel)
        if (!page.every((level): level is number => typeof level === "number" && Number.isSafeInteger(level) && level > 0)) break
        levels.push(...page)
        if (senders.length < limit) return noStore({ ok: true, levels })
      }
    } catch { /* A partial result cannot be used as the total. */ }
    return noStore({ ok: false, error: "DIAMOND_EARNINGS_UNAVAILABLE" }, 502)
  }

  return noStore({ ok: false, error: "INVALID_ACTION" }, 400)
}
