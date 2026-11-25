"use client"
import { identity } from "deso-protocol"
import { signedDeSoTransactionHash, financialSubmissionBlock,markFinancialPending,markFinancialSubmitted,withFinancialAccountLock } from "./financial-submission"
export async function submitGuardedNFT(key:string,postHash:string,serial:number,cost:number,signed:string,assertAccount:()=>Promise<void>){
 if(!Number.isSafeInteger(cost)||cost<1)throw new Error("Invalid NFT cost")
 const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(signed)); const intent="nft:"+postHash.toLowerCase()+":"+serial+":"+Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("")
 await withFinancialAccountLock(key,async()=>{
   await assertAccount()
   const blocked=await financialSubmissionBlock(key,intent)
   if(blocked)throw new Error(blocked)
   const record={publicKey:key,intent,amountNanos:cost,startedAt:Date.now(),transactionHashHex:signedDeSoTransactionHash(signed)}
   await assertAccount()
   markFinancialPending(record)
   const result=await identity.submitTx(signed)
   markFinancialSubmitted(record,result?.TxnHashHex??result?.TransactionHashHex)
 })
}