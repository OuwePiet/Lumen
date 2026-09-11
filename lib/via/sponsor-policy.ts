export type ViaSponsorPlacement = "home" | "games" | "collection"

export type ViaSponsorCard = {
  sponsorId: string
  name: string
  destinationUrl: string
  placement: ViaSponsorPlacement
  startsAt: string
  endsAt: string
  funded: boolean
}

export type ViaSponsorDecision =
  | { visible: true; label: "Sponsored"; card: ViaSponsorCard }
  | { visible: false; reason: "not-funded" | "not-started" | "expired" | "invalid-url" }

function isSafeSponsorUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "https:"
  } catch {
    return false
  }
}

export function evaluateSponsorCard(
  card: ViaSponsorCard,
  nowIso: string
): ViaSponsorDecision {
  if (!card.funded) return { visible: false, reason: "not-funded" }
  if (!isSafeSponsorUrl(card.destinationUrl)) return { visible: false, reason: "invalid-url" }

  const now = Date.parse(nowIso)
  const starts = Date.parse(card.startsAt)
  const ends = Date.parse(card.endsAt)

  if (!Number.isFinite(now) || !Number.isFinite(starts) || !Number.isFinite(ends) || ends <= starts) {
    return { visible: false, reason: "expired" }
  }
  if (now < starts) return { visible: false, reason: "not-started" }
  if (now >= ends) return { visible: false, reason: "expired" }

  return { visible: true, label: "Sponsored", card }
}

export const VIA_SPONSOR_GUIDE = {
  independence:
    "Sponsorship never changes feed ranking, verification, reward eligibility, auction results or NFT ownership.",
  disclosure:
    "Every paid placement is visibly labelled Sponsored.",
  smallSponsors:
    "VIA can offer simple fixed placements suitable for small creators, communities and services without requiring an external advertising network.",
  funding:
    "A placement becomes visible only after its sponsorship is confirmed as funded.",
} as const
