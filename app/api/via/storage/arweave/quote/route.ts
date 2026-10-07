import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const ARWEAVE_PRICE_URL = "https://arweave.net/price"
const VIA_STORAGE_SERVICE_BASIS_POINTS = 500
const BASIS_POINTS_DENOMINATOR = 10_000

export async function GET(request: NextRequest) {
  const rawBytes = request.nextUrl.searchParams.get("bytes")
  const bytes = Number(rawBytes)

  if (!Number.isSafeInteger(bytes) || bytes <= 0) {
    return NextResponse.json({ ok: false, error: "INVALID_BYTES" }, { status: 400 })
  }

  try {
    const response = await fetch(`${ARWEAVE_PRICE_URL}/${bytes}`, {
      cache: "no-store",
      headers: { Accept: "text/plain" },
    })
    if (!response.ok) {
      return NextResponse.json({ ok: false, error: "ARWEAVE_PRICE_UNAVAILABLE" }, { status: 502 })
    }

    const raw = (await response.text()).trim()
    if (!/^\d+$/.test(raw)) {
      return NextResponse.json({ ok: false, error: "INVALID_ARWEAVE_PRICE" }, { status: 502 })
    }

    const providerPriceWinston = Number(raw)
    if (!Number.isSafeInteger(providerPriceWinston)) {
      return NextResponse.json({ ok: false, error: "INVALID_ARWEAVE_PRICE" }, { status: 502 })
    }
    const viaStorageServiceWinston = Math.ceil((providerPriceWinston * VIA_STORAGE_SERVICE_BASIS_POINTS) / BASIS_POINTS_DENOMINATOR)
    const totalWinston = providerPriceWinston + viaStorageServiceWinston

    return NextResponse.json({
      ok: true,
      provider: "Arweave",
      bytes,
      priceWinston: raw,
      viaStorageService: {
        basisPoints: VIA_STORAGE_SERVICE_BASIS_POINTS,
        percent: 5,
        amountWinston: String(viaStorageServiceWinston),
        collectionStatus: "not-collected",
      },
      totalWinston: String(totalWinston),
      quotedAt: new Date().toISOString(),
      paymentStatus: "not-collected",
      uploadStatus: "not-started",
    }, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return NextResponse.json({ ok: false, error: "ARWEAVE_PRICE_UNAVAILABLE" }, { status: 502 })
  }
}
