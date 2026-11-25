import { viaModernIdentity } from "./deso-identity-modern"
type Permission=Parameters<typeof viaModernIdentity.hasPermissions>[0]
// 3.4.1: DeSo is the sole authority; additional consent is handled by Identity.
export async function ensureNFTPermission(required:Permission,assertAccount:()=>Promise<void>,adapter=viaModernIdentity){
 await assertAccount()
 if(await adapter.hasPermissions(required)){await assertAccount();return}
 await assertAccount()
 await adapter.requestPermissions(required)
 await assertAccount()
}