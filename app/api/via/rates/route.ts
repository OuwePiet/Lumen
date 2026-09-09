import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const DEFAULT_RATE_URL = "https://api.coingecko.com/api/v3/simple/price?ids=deso&vs_currencies=usd,eur"
const RATE_URL = process.env.VIA_RATE_URL || DEFAULT_RATE_URL
const TIMEOUT_MS = 4500

type ProviderPayload = Record<string, { usd?: unknown; eur?: unknown } | undefined>

function positiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null
}

export async function GET() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const checkedAt = new Date().toISOString()

  try {
    const response = await fetch(RATE_URL, {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    })

    if (!response.ok) {
      return NextResponse.json(
        { status: "unavailable", checkedAt, rates: null },
        { status: 503, headers: { "cache-control": "no-store, max-age=0" } },
      )
    }

    const payload = (await response.json()) as ProviderPayload
    const quote = payload.deso
    const usd = positiveNumber(quote?.usd)
    const eur = positiveNumber(quote?.eur)

    if (usd === null || eur === null) {
      return NextResponse.json(
        { status: "unavailable", checkedAt, rates: null },
        { status: 503, headers: { "cache-control": "no-store, max-age=0" } },
      )
    }

    return NextResponse.json(
      {
        status: "current",
        checkedAt,
        asset: "DESO",
        rates: { USD: usd, EUR: eur },
      },
      { headers: { "cache-control": "no-store, max-age=0" } },
    )
  } catch {
    return NextResponse.json(
      { status: "unavailable", checkedAt, rates: null },
      { status: 503, headers: { "cache-control": "no-store, max-age=0" } },
    )
  } finally {
    clearTimeout(timeout)
  }
}
