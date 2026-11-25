"use client"
import {submitPost,identity} from "deso-protocol"
import {viaModernIdentity} from "../deso-identity-modern"
import {ensureNFTPermission} from "../nft-permissions"
export async function prepareNativePost(key:string,body:string,imageUrls:string[],videoUrls:string[],parentStakeID="",pollOptions:string[]=[],sensitive=false,repostedHash=""){
 const assertAccount=async()=>{if((await viaModernIdentity.currentUser())?.publicKey!==key||(await identity.snapshot()).currentUser?.publicKey!==key)throw new Error("DESO_ACCOUNT_CHANGED_RECONNECT")}
 await assertAccount()
 const PostExtraData:Record<string,string>={ViaClient:"viadeso.online"}
 if(pollOptions.length>=2)PostExtraData.PollOptions=JSON.stringify(pollOptions)
 if(!parentStakeID&&sensitive)PostExtraData.ViaSensitiveContent="1"
 const {constructedTransactionResponse:tx}=await submitPost({UpdaterPublicKeyBase58Check:key,PostHashHexToModify:"",ParentStakeID:parentStakeID,RepostedPostHashHex:repostedHash,BodyObj:{Body:body.trim(),ImageURLs:imageUrls,VideoURLs:videoUrls},PostExtraData,IsHidden:false,MinFeeRateNanosPerKB:1000,TransactionFees:[]},{broadcast:false,checkPermissions:false,localConstruction:false})
 if(!tx.TransactionHex||!Number.isSafeInteger(tx.FeeNanos)||tx.FeeNanos<0)throw new Error("INVALID_POST_QUOTE")
 await ensureNFTPermission({GlobalDESOLimit:tx.FeeNanos,TransactionCountLimitMap:{SUBMIT_POST:1}},assertAccount)
 return {transactionHex:tx.TransactionHex,feeNanos:tx.FeeNanos,assertAccount}
}
export async function submitNativePost(signed:string,assertAccount:()=>Promise<void>){
 await assertAccount()
 const result=await identity.submitTx(signed)
 const postHashHex=[result?.PostEntryResponse?.PostHashHex,result?.TxnHashHex,result?.TransactionHashHex].find(v=>typeof v==="string"&&/^[0-9a-f]{64}$/i.test(v))
 return {postHashHex}
}