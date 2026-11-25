"use client"
import { identity } from "deso-protocol"
// 3.4.1: submit through the SDK; no account-wide local receipt or storage gate.
export async function submitGuardedNFT(_key:string,_postHash:string,_serial:number,_cost:number,signed:string,assertAccount:()=>Promise<void>){
 await assertAccount()
 await identity.submitTx(signed)
}