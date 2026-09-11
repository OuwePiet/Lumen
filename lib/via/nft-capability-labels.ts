import type { ViaUtilityCapability } from "./nft-capability"

export function utilityCapabilityLabel(capability: ViaUtilityCapability) {
  if (capability.allowed) {
    return capability.reason === "public"
      ? "Available"
      : "Ownership verified"
  }

  switch (capability.reason) {
    case "ownership-required":
      return "Current NFT ownership required"
    case "identity-required":
      return "Identity verification required"
    case "ownership-and-identity-required":
      return "NFT ownership and identity verification required"
    default:
      return "Unavailable"
  }
}

/**
 * Capability labels explain a policy decision only. They must not be used as
 * authentication state or as authorization to reveal private utility targets.
 */
export function canRevealPrivateUtilityTarget(capability: ViaUtilityCapability) {
  return capability.allowed && capability.reason !== "public"
}
