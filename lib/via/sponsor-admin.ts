export type ViaSponsorAdminIdentity = {
  publicKey: string
}

export type ViaSponsorAdminAccess = {
  allowed: boolean
  reason: "owner" | "not-owner" | "missing-owner-config"
}

/**
 * Sponsor Admin is deliberately separate from public sponsor pages.
 * The configured owner public key must be supplied by secure server-side
 * configuration; never expose a private key or signing secret here.
 */
export function sponsorAdminAccess(input: {
  viewer?: ViaSponsorAdminIdentity
  configuredOwnerPublicKey?: string
}): ViaSponsorAdminAccess {
  const owner = input.configuredOwnerPublicKey?.trim()
  if (!owner) return { allowed: false, reason: "missing-owner-config" }

  const viewer = input.viewer?.publicKey.trim()
  if (!viewer || viewer !== owner) {
    return { allowed: false, reason: "not-owner" }
  }

  return { allowed: true, reason: "owner" }
}

export const VIA_SPONSOR_ADMIN_SECTIONS = [
  "Pending review",
  "Approved / awaiting payment",
  "Active sponsors",
  "Second payment due",
  "Expired",
  "Rejected",
  "Payment & forwarding log",
] as const

export const VIA_SPONSOR_ADMIN_GUIDE = {
  private:
    "Sponsor Admin is private and is not linked from public VIA navigation.",
  ownerOnly:
    "Only the configured VIA owner identity may open Sponsor Admin. Everyone else is denied.",
  secrets:
    "Sponsor Admin authorization uses authenticated identity; VIA never stores or exposes a private key in client code.",
  review:
    "Pending applications show the exact static creative and website together with Approve and Reject controls.",
  ledger:
    "Sponsor payment receipt, activation, forwarding and expiry are tracked as separate auditable states.",
} as const
