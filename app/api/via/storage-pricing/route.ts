import { NextResponse } from "next/server"
import { VIA_STORAGE_TIERS, type ViaStoragePriceBoard } from "../../../via-storage-pricing"

export const dynamic = "force-dynamic"

export async function GET() {
  const hasPublishedPrices = VIA_STORAGE_TIERS.some(
    (tier) => tier.available && typeof tier.customerPriceEur === "number",
  )

  const payload: ViaStoragePriceBoard = {
    currency: "EUR",
    checkedAt: new Date().toISOString(),
    status: hasPublishedPrices ? "current" : "review",
    tiers: VIA_STORAGE_TIERS,
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  })
}
