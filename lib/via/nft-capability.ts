import type { ViaNftUtility } from "./nft-utility"

export type ViaUtilityCapability = {
  kind: ViaNftUtility["kind"]
  label: string
  allowed: boolean
  reason:
    | "public"
    | "ownership-required"
    | "identity-required"
    | "ownership-and-identity-required"
}

export function evaluateUtilityCapability(input: {
  utility: ViaNftUtility
  ownsCurrentEdition: boolean
  identityVerified: boolean
}): ViaUtilityCapability {
  const { utility, ownsCurrentEdition, identityVerified } = input

  if (!utility.requiresCurrentOwnership) {
    return { kind: utility.kind, label: utility.label, allowed: true, reason: "public" }
  }

  if (!ownsCurrentEdition && !identityVerified) {
    return {
      kind: utility.kind,
      label: utility.label,
      allowed: false,
      reason: "ownership-and-identity-required",
    }
  }

  if (!ownsCurrentEdition) {
    return { kind: utility.kind, label: utility.label, allowed: false, reason: "ownership-required" }
  }

  if (!identityVerified) {
    return { kind: utility.kind, label: utility.label, allowed: false, reason: "identity-required" }
  }

  return { kind: utility.kind, label: utility.label, allowed: true, reason: "public" }
}
