"use client"
import { submitGuardedNFT } from "./nft-submission-guard"
import { ensureNFTPermission } from "./nft-permissions"
import { createNFTBid, identity } from "deso-protocol"
import { viaModernIdentity } from "./deso-identity-modern"

// DeSo SDK 3.4.1: no VIA transaction endpoint.
export async function submitNativeNFTBid(key:string, postHash:string, serial:number, amount:number, onFee:(fee:number)=>void, onSubmit:()=>void){
 const assertAccount=async()=>{if((await viaModernIdentity.currentUser())?.publicKey!==key||(await identity.snapshot()).currentUser?.publicKey!==key)throw new Error("Account changed")}
 await assertAccount()
 const {constructedTransactionResponse:tx}=await createNFTBid({UpdaterPublicKeyBase58Check:key,NFTPostHashHex:postHash,SerialNumber:serial,BidAmountNanos:amount,MinFeeRateNanosPerKB:1000,TransactionFees:[]},{broadcast:false,checkPermissions:false})
 if(!tx.TransactionHex||!Number.isSafeInteger(tx.FeeNanos)||tx.FeeNanos<0||!Number.isSafeInteger(amount+tx.FeeNanos))throw new Error("Invalid fee")
 onFee(tx.FeeNanos)
 await assertAccount()
 const permission={GlobalDESOLimit:amount+tx.FeeNanos,NFTOperationLimitMap:{[postHash]:{[serial]:{nft_bid:1}}}}
 await ensureNFTPermission(permission,assertAccount)
 await assertAccount()
 if(!(await viaModernIdentity.hasPermissions(permission)))throw new Error("Permission missing")
 await assertAccount()
 const signed=await viaModernIdentity.signTx(tx.TransactionHex)
 await assertAccount()
 onSubmit()
 await submitGuardedNFT(key,postHash,serial,permission.GlobalDESOLimit,signed,assertAccount)
}