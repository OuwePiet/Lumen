import { guardTxPermission } from "deso-protocol/src/transactions/utils.js"

export async function ensureNFTPermission(
  required: Parameters<typeof guardTxPermission>[0],
  assertAccount: () => Promise<void>,
  authorize = guardTxPermission,
) {
  await assertAccount()
  await authorize(required)
  await assertAccount()
}
