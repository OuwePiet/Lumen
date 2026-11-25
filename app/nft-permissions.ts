import { viaModernIdentity } from "./deso-identity-modern"
type Permission=Parameters<typeof viaModernIdentity.requestPermissions>[0]
// Preserve existing DeSo grants when extending NFT permissions.
export async function ensureNFTPermission(required:Permission,assertAccount:()=>Promise<void>,adapter=viaModernIdentity){
 await assertAccount()
 if(await adapter.hasPermissions(required))return
 await adapter.refreshSpendingLimits()
 await assertAccount()
 if(await adapter.hasPermissions(required))return
 const current=await adapter.spendingLimits()
 const merge=(old:any,next:any):any=>{
   if(old==="UNLIMITED"||next==="UNLIMITED")return "UNLIMITED"
   if(typeof next==="number")return Math.max(typeof old==="number"?old:0,next)
   if(next&&typeof next==="object"&&!Array.isArray(next)){
     const out={...old}
     for(const k of Object.keys(next))out[k]=merge(old?.[k],next[k])
     return out
   }
   return next
 }
 const grant=merge(current??{},required)
 // Preserve scoped DeSo group grants by semantic identity, not array index.
 for(const field of ['AccessGroupLimitMap','AccessGroupMemberLimitMap'] as const){
   if(!required[field])continue
   const combined=new Map<string,any>()
   for(const entry of [...(current?.[field]??[]),...required[field]]){
     const id=JSON.stringify([entry.AccessGroupOwnerPublicKeyBase58Check,entry.ScopeType,entry.AccessGroupKeyName,entry.OperationType])
     const previous=combined.get(id)
     combined.set(id,{...entry,OpCount:previous?.OpCount==="UNLIMITED"||entry.OpCount==="UNLIMITED"?"UNLIMITED":Math.max(previous?.OpCount??0,entry.OpCount)})
   }
   grant[field]=Array.from(combined.values())
 }
 await assertAccount()
 await adapter.requestPermissions(grant)
 await assertAccount()
 if(!(await adapter.hasPermissions(required)))throw new Error("NFT permission not granted")
}