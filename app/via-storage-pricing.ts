export const VIA_STORAGE_PRICE_REFRESH_MS = 5 * 60 * 1000

export type ViaStorageTier = {
  id: string
  label: string
  sizeLabel: string
  customerPriceEur: number | null
  available: boolean
}

export type ViaStoragePriceBoard = {
  currency: "EUR"
  checkedAt: string
  status: "current" | "review"
  tiers: ViaStorageTier[]
}

export const VIA_STORAGE_TIERS: ViaStorageTier[] = [
  { id: "creator-10mb", label: "Creator", sizeLabel: "up to 10 MB", customerPriceEur: null, available: false },
  { id: "creator-50mb", label: "Creator", sizeLabel: "up to 50 MB", customerPriceEur: null, available: false },
  { id: "creator-100mb", label: "Creator", sizeLabel: "up to 100 MB", customerPriceEur: null, available: false },
  { id: "creator-500mb", label: "Creator", sizeLabel: "up to 500 MB", customerPriceEur: null, available: false },
  { id: "archive-5gb", label: "Archive", sizeLabel: "500 MB–5 GB", customerPriceEur: null, available: false },
  { id: "collection-500gb", label: "Museum / collection", sizeLabel: "50–500 GB", customerPriceEur: null, available: false },
  { id: "institutional-1tb", label: "Institutional", sizeLabel: "1 TB+", customerPriceEur: null, available: false },
]

export async function fetchViaStoragePrices(signal?: AbortSignal): Promise<ViaStoragePriceBoard> {
  const response = await fetch("/api/via/storage-pricing", {
    cache: "no-store",
    signal,
  })

  if (!response.ok) throw new Error("VIA storage pricing unavailable")
  return (await response.json()) as ViaStoragePriceBoard
}
