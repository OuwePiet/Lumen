import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../deso-api"
export const dynamic="force-dynamic"
const json=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"no-store"}})
const validHex=(v:unknown):v is string=>typeof v==="string"&&v.length>=2&&v.length<=500000&&v.length%2===0&&/^[0-9a-fA-F]+$/.test(v)
export async function POST(request:Request){
 let body:Record<string,unknown>;try{body=await request.json()}catch{return json({ok:false,error:"INVALID_JSON"},400)}
 if(body.action==="prepare"){
  const publicKey=typeof body.publicKey==="string"?body.publicKey.trim():"",username=typeof body.username==="string"?body.username.trim():"",description=typeof body.description==="string"?body.description:"",profilePic=typeof body.profilePic==="string"?body.profilePic:"",fr=Number(body.creatorBasisPoints)
  if(!publicKey||!username||username.length>25||description.length>20000||profilePic.length>5000000||!Number.isInteger(fr)||fr<0||fr>10000)return json({ok:false,error:"INVALID_PROFILE"},400)
  try{const response=await fetchDeSo("update-profile",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({UpdaterPublicKeyBase58Check:publicKey,ProfilePublicKeyBase58Check:publicKey,NewUsername:username,NewDescription:description,NewProfilePic:profilePic,NewCreatorBasisPoints:fr,NewStakeMultipleBasisPoints:12500,IsHidden:false,MinFeeRateNanosPerKB:1000,TransactionFees:[]})})
   if(!response.ok)return json({ok:false,error:"DESO_PROFILE_PREPARE_REJECTED"},502);const data=await response.json() as Record<string,unknown>;if(!validHex(data.TransactionHex))return json({ok:false,error:"INVALID_PREPARED_TRANSACTION"},502);return json({ok:true,transactionHex:data.TransactionHex,feeNanos:typeof data.FeeNanos==="number"?data.FeeNanos:null})
  }catch{return json({ok:false,error:"DESO_PROFILE_PREPARE_UNAVAILABLE"},503)}
 }
 if(body.action==="submit"){if(!validHex(body.signedTransactionHex))return json({ok:false,error:"INVALID_SIGNED_TRANSACTION"},400);try{const response=await fetchDeSo("submit-transaction",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({TransactionHex:body.signedTransactionHex})});if(!response.ok)return json({ok:false,error:"DESO_PROFILE_SUBMIT_REJECTED"},502);return json({ok:true,transaction:await response.json()})}catch{return json({ok:false,error:"DESO_PROFILE_SUBMIT_UNAVAILABLE"},503)}}
 return json({ok:false,error:"INVALID_ACTION"},400)
}