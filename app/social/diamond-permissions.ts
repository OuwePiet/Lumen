import type { ViaModernIdentityAdapter } from "../deso-identity-modern"

/** Read the official grant only; never initiate a new authorization from a post. */
export async function ensureDiamondPermission(identity: Pick<ViaModernIdentityAdapter, "hasPermissions" | "refreshSpendingLimits">, spendNanos: number) {
  if (!Number.isSafeInteger(spendNanos) || spendNanos < 0) throw new Error("INVALID_DESO_SPEND_LIMIT")
  const required = { GlobalDESOLimit: spendNanos, TransactionCountLimitMap: { BASIC_TRANSFER: 1 } }
  if (await identity.hasPermissions(required)) return
  await identity.refreshSpendingLimits()
  if (await identity.hasPermissions(required)) return
  throw new Error("DESO_HOMEPAGE_AUTHORIZATION_REQUIRED")
}