"use client"

import { useEffect, useState } from "react"
import {
  fetchViaStoragePrices,
  VIA_STORAGE_PRICE_REFRESH_MS,
  type ViaStoragePriceBoard as ViaStoragePriceBoardData,
} from "./via-storage-pricing"

type BoardState = {
  data: ViaStoragePriceBoardData | null
  unavailable: boolean
}

export default function ViaStoragePriceBoard() {
  const [state, setState] = useState<BoardState>({ data: null, unavailable: false })

  useEffect(() => {
    let active = true
    let controller: AbortController | null = null

    const refresh = async () => {
      controller?.abort()
      controller = new AbortController()
      try {
        const data = await fetchViaStoragePrices(controller.signal)
        if (active) setState({ data, unavailable: false })
      } catch (error) {
        if (active && !(error instanceof DOMException && error.name === "AbortError")) {
          setState((current) => ({ ...current, unavailable: true }))
        }
      }
    }

    void refresh()
    const timer = window.setInterval(refresh, VIA_STORAGE_PRICE_REFRESH_MS)

    return () => {
      active = false
      controller?.abort()
      window.clearInterval(timer)
    }
  }, [])

  return (
    <section aria-label="VIA storage prices" style={{ marginTop: 10, fontSize: 13, lineHeight: 1.55 }}>
      <strong style={{ fontWeight: 600 }}>Storage</strong>
      {state.unavailable ? (
        <span style={{ marginLeft: 8, opacity: 0.68 }}>prices unavailable</span>
      ) : !state.data ? (
        <span style={{ marginLeft: 8, opacity: 0.68 }}>updating…</span>
      ) : state.data.status === "review" ? (
        <span style={{ marginLeft: 8, opacity: 0.68 }}>customer prices being verified</span>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 4 }}>
          {state.data.tiers
            .filter((tier) => tier.available && typeof tier.customerPriceEur === "number")
            .map((tier) => (
              <span key={tier.id}>
                {tier.sizeLabel}: €{tier.customerPriceEur!.toFixed(2)}
              </span>
            ))}
        </div>
      )}
    </section>
  )
}
