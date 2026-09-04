// VIA simple onboarding foundation (Module A + I)
//
// Start with e-mail/OTP; link a DeSo identity later for ownership/on-chain use.
// OTP verification and persistence belong behind the VIA Gatekeeper/database.
// This module does not perform blockchain transactions.

export type ViaAccessLevel = "guest" | "verified" | "wallet-linked"

export type ViaCapabilities = {
  storage: boolean
  spotlight: boolean
  ownership: boolean
  onChain: boolean
}

export type ViaSimpleAccount = {
  userId: string
  email: string
  accessLevel: ViaAccessLevel
  desoPublicKey?: string
}

export function capabilitiesFor(account?: ViaSimpleAccount): ViaCapabilities {
  const verified = account?.accessLevel === "verified" || account?.accessLevel === "wallet-linked"
  const walletLinked = account?.accessLevel === "wallet-linked" && Boolean(account.desoPublicKey)
  return { storage: verified, spotlight: verified, ownership: walletLinked, onChain: walletLinked }
}

export async function startViaSimpleOnboarding(email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail || !normalizedEmail.includes("@")) throw new Error("A valid e-mail address is required")

  // Integration point: existing VIA Gatekeeper sends the OTP.
  return { email: normalizedEmail, next: "verify-otp" as const }
}

export async function completeViaSimpleOnboarding(userId: string, email: string): Promise<ViaSimpleAccount> {
  // Call only after Gatekeeper has successfully verified the OTP.
  // Integration point: persist account and create the real server-side session.
  return { userId, email: email.trim().toLowerCase(), accessLevel: "verified" }
}

export async function laterLinkDeSoWallet(account: ViaSimpleAccount, desoPublicKey: string): Promise<ViaSimpleAccount> {
  const publicKey = desoPublicKey.trim()
  if (!publicKey) throw new Error("A DeSo public key is required")

  // Gatekeeper must verify control of this DeSo identity before persistence.
  return { ...account, desoPublicKey: publicKey, accessLevel: "wallet-linked" }
}
