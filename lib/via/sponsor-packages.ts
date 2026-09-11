export type ViaSponsorPackageId = "starter" | "spotlight" | "collection"

export type ViaSponsorPackage = {
  id: ViaSponsorPackageId
  durationDays: number
  maxPlacements: number
  priceCents: number
  label: string
}

export const VIA_SPONSOR_PACKAGES: ViaSponsorPackage[] = [
  {
    id: "starter",
    durationDays: 7,
    maxPlacements: 1,
    priceCents: 100,
    label: "Starter · 7 days",
  },
  {
    id: "spotlight",
    durationDays: 14,
    maxPlacements: 1,
    priceCents: 175,
    label: "Spotlight · 14 days",
  },
  {
    id: "collection",
    durationDays: 30,
    maxPlacements: 1,
    priceCents: 300,
    label: "Collection · 30 days",
  },
]

export function sponsorPackage(id: ViaSponsorPackageId) {
  return VIA_SPONSOR_PACKAGES.find((item) => item.id === id)
}

export const VIA_SPONSOR_PRICING_GUIDE = {
  principle:
    "Sponsor pricing is intentionally small and fixed so individual creators and small communities can participate.",
  noAuction:
    "Sponsor visibility is not auctioned and cannot be purchased to influence organic VIA ranking.",
  disclosure:
    "All sponsor packages use the same visible Sponsored disclosure.",
  configurable:
    "Package prices are configuration values and may be reviewed before public launch.",
} as const
