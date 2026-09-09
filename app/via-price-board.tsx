"use client"

import { useEffect, useState } from "react"
import {
  fetchViaRates,
  isViaRateStale,
  VIA_RATE_REFRESH_MS,
  type ViaRates,
} from "./via-live-rates"

type BoardState = {
  rates: ViaRates | null
  unavailable: boolean
}

export default function ViaPriceBoard() {
  const [state, setState] = useState<BoardState>({ rates: null, unavailable: false })
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    let active = true
    let controller: AbortController | null = null

    const refresh = async () => {
      controller?.abort()
      controller = new AbortController()
      try {
        const rates = await fetchViaRates(controller.signal)
        if (active) setState({ rates, unavailable: false })
      } catch (error) {
        if (active && !(error instanceof DOMException && error.name === "AbortError")) {
          setState((current) => ({ ...current, unavailable: true }))
        }
      } finally {
        if (active) setNow(Date.now())
      }
    }

    void refresh()
    const refreshTimer = window.setInterval(refresh, VIA_RATE_REFRESH_MS)
    const clockTimer = window.setInterval(() => setNow(Date.now()), 30_000)

    return () => {
      active = false
      controller?.abort()
      window.clearInterval(refreshTimer)
      window.clearInterval(clockTimer)
    }
  }, [])

  const stale = state.rates ? isViaRateStale(state.rates.checkedAt, now) : false
  const usable = state.rates?.rates && !stale && !state.unavailable
  const checked = state.rates?.checkedAt
    ? new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(
        new Date(state.rates.checkedAt),
      )
    : null

  return (
    <section aria-label="VIA live prices" style={{ fontSize: 13, lineHeight: 1.55 }}>
      <strong style={{ fontWeight: 600 }}>DESO</strong>{" "}
      {usable ? (
        <>
          <span>${state.rates!.rates!.USD.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
          <span aria-hidden="true"> · </span>
          <span>€{state.rates!.rates!.EUR.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
        </>
      ) : (
        <span>rate unavailable</span>
      )}
      <span style={{ marginLeft: 8, opacity: 0.68 }}>
        {stale ? "Stale" : state.unavailable ? "Unavailable" : checked ? `Updated ${checked}` : "Updating…"}
      </span>
    </section>
  )
}
