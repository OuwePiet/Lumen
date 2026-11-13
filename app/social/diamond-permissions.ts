import type { ViaModernIdentityAdapter } from "../deso-identity-modern"

/** Check the cost of this transaction, not remaining budget plus the cost. */
export async function ensureDiamondPermission(identity: Pick<ViaModernIdentityAdapter, "hasPermissions" | "requestPermissions" | "spendingLimits">, spendNanos: number) {
  if (!Number.isSafeInteger(spendNanos) || spendNanos < 0) throw new Error("INVALID_DESO_SPEND_LIMIT")
  const required = { GlobalDESOLimit: spendNanos, TransactionCountLimitMap: { BASIC_TRANSFER: 1 } }
  if (await identity.hasPermissions(required)) return
  const current = await identity.spendingLimits()
  const remaining = current?.GlobalDESOLimit ?? 0
  if (!Number.isSafeInteger(remaining) || remaining < 0) throw new Error("INVALID_DESO_SPENDING_LIMITS")
  const basic: unknown = current?.TransactionCountLimitMap?.BASIC_TRANSFER
  const permissions = {
    ...current,
    GlobalDESOLimit: Math.max(remaining, spendNanos),
    TransactionCountLimitMap: { ...current?.TransactionCountLimitMap, BASIC_TRANSFER: basic === "UNLIMITED" ? "UNLIMITED" as const : Math.max(typeof basic === "number" ? basic : 0, 1) },
  }
  await identity.requestPermissions(permissions)
  if (!(await identity.hasPermissions(required))) throw new Error("DIAMOND_PERMISSION_NOT_GRANTED")
}
