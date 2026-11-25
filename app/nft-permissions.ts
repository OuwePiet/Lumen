import { viaModernIdentity } from "./deso-identity-modern"
type Permission=Parameters<typeof viaModernIdentity.hasPermissions>[0]
// 3.4.1: DeSo is the sole authority. Never request or merge grants here.
export async function ensureNFTPermission(required:Permission,assertAccount:()=>Promise<void>,adapter=viaModernIdentity){
 await assertAccount()
 if(await adapter.hasPermissions(required)){await assertAccount();return}
 await adapter.refreshSpendingLimits()
 await assertAccount()
 if(await adapter.hasPermissions(required)){await assertAccount();return}
 throw new Error("DESO_HOMEPAGE_AUTHORIZATION_REQUIRED")
}