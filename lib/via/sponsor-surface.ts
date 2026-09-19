export type ViaSponsorSurface = "homepage-city-slot" | "community-support"

export type ViaSponsorSurfaceDecision =
  | { allowed: true; surface: ViaSponsorSurface }
  | { allowed: false; reason: "unsupported-sponsor-surface" }

export function sponsorSurfaceDecision(surface: string): ViaSponsorSurfaceDecision {
  if (surface === "homepage-city-slot" || surface === "community-support") {
    return { allowed: true, surface }
  }
  return { allowed: false, reason: "unsupported-sponsor-surface" }
}

export const VIA_SPONSOR_SURFACE_RULES = {
  homepage:
    "The VIA homepage may show paid sponsor material only in the designated top city card slot, visibly labelled Sponsored. Up to four reserved sponsors may rotate in that one slot; outside active windows the city returns.",
  community:
    "Community Support remains available as a separate sponsor/support environment.",
  noRankingInfluence:
    "Sponsor payment never buys feed ranking, verification, NFT prominence or other organic VIA placement.",
  capacity:
    "The homepage sponsor system accepts at most four reserved sponsor placements at once. When all four are occupied, new applications are closed until capacity returns.",
} as const
