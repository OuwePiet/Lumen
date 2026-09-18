import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../deso-api"

export const dynamic = "force-dynamic"

const DEFAULT_RATE_URL = "https://api.coingecko.com/api/v3/simple/price?ids=deso&vs_currencies=usd,eur"
function rateUrl() {
  const raw = process.env.VIA_RATE_URL?.trim()
  if (!raw) return DEFAULT_RATE_URL
  try {
    const url = new URL(raw)
    return url.protocol === "https:" ? url.toString() : DEFAULT_RATE_URL
  } catch {
    return DEFAULT_RATE_URL
  }
}

const RATE_URL = rateUrl()
const TIMEOUT_MS = 4500

type ProviderPayload = Record<string, { usd?: unknown; eur?: unknown } | undefined>

type DeSoExchangeRatePayload = {
  SatoshisPerDeSoExchangeRate?: unknown
  USDCentsPerBitcoinExchangeRate?: unknown
}

function positiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null
}


async function readDeSoNodeUsdReference() {
  try {
    const response = await fetchDeSo("get-exchange-rate", {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
    })
    if (!response.ok) return null
    const payload = (await response.json()) as DeSoExchangeRatePayload
    const satoshisPerDeSo = positiveNumber(payload.SatoshisPerDeSoExchangeRate)
    const usdCentsPerBitcoin = positiveNumber(payload.USDCentsPerBitcoinExchangeRate)
    if (satoshisPerDeSo === null || usdCentsPerBitcoin === null) return null
    return (satoshisPerDeSo / 100_000_000) * (usdCentsPerBitcoin / 100)
  } catch {
    return null
  }
}

export async function GET() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const checkedAt = new Date().toISOString()

  try {
    const [response, nodeReferenceUsd] = await Promise.all([
      fetch(RATE_URL, {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
      }),
      readDeSoNodeUsdReference(),
    ])

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
        references: { deSoNodeUSD: nodeReferenceUsd },
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
