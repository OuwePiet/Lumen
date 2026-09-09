export type ViaRates = {
  status: "current" | "unavailable"
  checkedAt: string
  asset?: "DESO"
  rates: { USD: number; EUR: number } | null
}

export const VIA_RATE_REFRESH_MS = 60_000
export const VIA_RATE_STALE_MS = 3 * VIA_RATE_REFRESH_MS

export async function fetchViaRates(signal?: AbortSignal): Promise<ViaRates> {
  const response = await fetch("/api/via/rates", {
    cache: "no-store",
    headers: { accept: "application/json" },
    signal,
  })

  const data = (await response.json()) as ViaRates
  if (!response.ok || data.status !== "current" || !data.rates) {
    throw new Error("VIA rates unavailable")
  }
  return data
}

export function isViaRateStale(checkedAt: string, now = Date.now()) {
  const timestamp = Date.parse(checkedAt)
  return !Number.isFinite(timestamp) || now - timestamp > VIA_RATE_STALE_MS
}
