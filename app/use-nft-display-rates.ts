"use client"
import { useEffect, useState } from "react"
import { fetchViaRates, VIA_RATE_REFRESH_MS, type ViaRates } from "./via-live-rates"
export default function useNFTDisplayRates(enabled = true) {
  const [rates, setRates] = useState<ViaRates | null>(null)
  useEffect(() => {
    if (!enabled) return
    let active = true
    let controller: AbortController | null = null
    const refresh = () => {
      controller?.abort(); controller = new AbortController()
      void fetchViaRates(controller.signal).then(value => { if (active) setRates(value) }).catch(() => { if (active) setRates(null) })
    }
    refresh()
    const timer = window.setInterval(refresh, VIA_RATE_REFRESH_MS)
    return () => { active = false; controller?.abort(); window.clearInterval(timer) }
  }, [enabled])
  return rates
}