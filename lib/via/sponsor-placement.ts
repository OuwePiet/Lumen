export type ViaSponsorPlacementWindow = {
  startsAtMs: number
  endsAtMs: number
}

export function sponsorPlacementIsWithinPaidWindow(
  window: ViaSponsorPlacementWindow,
  nowMs: number,
): boolean {
  if (!Number.isSafeInteger(window.startsAtMs) || !Number.isSafeInteger(window.endsAtMs)) return false
  if (window.endsAtMs <= window.startsAtMs) return false
  if (!Number.isSafeInteger(nowMs)) return false

  return nowMs >= window.startsAtMs && nowMs < window.endsAtMs
}

export function sponsorPlacementMayRender(input: {
  activationApproved: boolean
  withinPaidWindow: boolean
  currentMaterialApproved: boolean
}): boolean {
  return (
    input.activationApproved &&
    input.withinPaidWindow &&
    input.currentMaterialApproved
  )
}

export const VIA_SPONSOR_PLACEMENT_RULES = {
  start:
    "A sponsor placement is rendered only after approval and confirmed payment have activated its paid placement window.",
  end:
    "At the exact end of the paid placement window, public rendering stops automatically.",
  revision:
    "If the current sponsor material loses approval because it changed, public rendering stops until the new revision is approved.",
  cleanHomepage:
    "Sponsor rendering belongs to the designated Community Support/sponsor environment and must not silently introduce advertising into the clean VIA homepage.",
} as const
