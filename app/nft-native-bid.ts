"use client"
import { createNFTBid, identity } from "deso-protocol"
import { viaModernIdentity } from "./deso-identity-modern"

// DeSo SDK 3.4.1: no VIA transaction endpoint.
export async function submitNativeNFTBid(key:string, postHash:string, serial:number, amount:number, onFee:(fee:number)=>void, onSubmit:()=>void){
 const assertAccount=async()=>{if((await viaModernIdentity.currentUser())?.publicKey!==key||(await identity.snapshot()).currentUser?.publicKey!==key)throw new Error("Account changed")}
 await assertAccount()
 onSubmit()
 const {constructedTransactionResponse:tx}=await createNFTBid({UpdaterPublicKeyBase58Check:key,NFTPostHashHex:postHash,SerialNumber:serial,BidAmountNanos:amount,MinFeeRateNanosPerKB:1000,TransactionFees:[]},{})
 onFee(tx.FeeNanos)
}
