export type ViaSponsorSurface = "community-support"

export type ViaSponsorSurfaceDecision =
  | { allowed: true; surface: "community-support" }
  | { allowed: false; reason: "homepage-kept-clean" | "unsupported-sponsor-surface" }

export function sponsorSurfaceDecision(surface: string): ViaSponsorSurfaceDecision {
  if (surface === "community-support") {
    return { allowed: true, surface: "community-support" }
  }

  if (surface === "home" || surface === "homepage") {
    return { allowed: false, reason: "homepage-kept-clean" }
  }

  return { allowed: false, reason: "unsupported-sponsor-surface" }
}

export const VIA_SPONSOR_SURFACE_RULES = {
  community:
    "Paid sponsor placements belong in VIA's separate Community Support environment.",
  homepage:
    "The VIA homepage remains free of paid sponsor placements.",
  noRankingInfluence:
    "Sponsor payment never buys feed ranking, verification, NFT prominence or other organic VIA placement.",
  explicitExpansion:
    "Any future sponsor surface requires a deliberate policy change and review; it is not enabled implicitly.",
} as const
