import type { ViaNftUtility } from "./nft-utility"

export type ViaUtilityTargetDecision = {
  reveal: boolean
  href?: string
  reason: "public-https" | "private" | "unsupported" | "missing"
}

/**
 * Public utility may expose an HTTPS target. Ownership-gated targets remain
 * hidden until a future authenticated server-side authorization flow approves
 * them. The via: scheme is intentionally not navigable here.
 */
export function evaluateUtilityTarget(utility: ViaNftUtility): ViaUtilityTargetDecision {
  if (!utility.target) return { reveal: false, reason: "missing" }

  if (utility.requiresCurrentOwnership) {
    return { reveal: false, reason: "private" }
  }

  if (/^https:\/\//i.test(utility.target)) {
    return { reveal: true, href: utility.target, reason: "public-https" }
  }

  return { reveal: false, reason: "unsupported" }
}
