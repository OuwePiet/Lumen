"use client"
import {submitPost} from "deso-protocol"

export async function publishNativePost(key:string,body:string,imageUrls:string[],videoUrls:string[],parentStakeID="",pollOptions:string[]=[],sensitive=false,repostedHash=""){
 const PostExtraData:Record<string,string>={ViaClient:"viadeso.online"}
 if(pollOptions.length>=2)PostExtraData.PollOptions=JSON.stringify(pollOptions)
 if(!parentStakeID&&sensitive)PostExtraData.ViaSensitiveContent="1"
 const {submittedTransactionResponse:result}=await submitPost({UpdaterPublicKeyBase58Check:key,PostHashHexToModify:"",ParentStakeID:parentStakeID,RepostedPostHashHex:repostedHash,BodyObj:{Body:body,ImageURLs:imageUrls,VideoURLs:videoUrls},PostExtraData,IsHidden:false,MinFeeRateNanosPerKB:1000,TransactionFees:[]},{localConstruction:false})
 const postHashHex=[result?.PostEntryResponse?.PostHashHex,result?.TxnHashHex].find(v=>typeof v==="string"&&/^[0-9a-f]{64}$/i.test(v))
 return {postHashHex}
}