import type { ViaModernIdentityAdapter } from "../deso-identity-modern"

/** SDK 3.4.1: request explicit DeSo consent only when the existing grant is insufficient. */
export async function ensureDiamondPermission(identity: Pick<ViaModernIdentityAdapter, "hasPermissions" | "requestPermissions">, spendNanos: number) {
  if (!Number.isSafeInteger(spendNanos) || spendNanos < 0) throw new Error("INVALID_DESO_SPEND_LIMIT")
  const required = { GlobalDESOLimit: spendNanos, TransactionCountLimitMap: { BASIC_TRANSFER: 1 } }
  if (await identity.hasPermissions(required)) return
  await identity.requestPermissions(required)
}