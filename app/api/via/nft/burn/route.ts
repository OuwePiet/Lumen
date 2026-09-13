import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../../deso-api"
export const dynamic="force-dynamic"
const DEFAULT_MIN_FEE_RATE_NANOS_PER_KB=1000
function json(data:unknown,status=200){return NextResponse.json(data,{status,headers:{"Cache-Control":"no-store"}})}
function pk(v:unknown):v is string{return typeof v==="string"&&v.length>=40&&v.length<=128&&/^[1-9A-HJ-NP-Za-km-z]+$/.test(v)}
function hash(v:unknown):v is string{return typeof v==="string"&&/^[0-9a-fA-F]{64}$/.test(v)}
function serial(v:unknown):v is number{return typeof v==="number"&&Number.isSafeInteger(v)&&v>0}
function hex(v:unknown):v is string{return typeof v==="string"&&v.length>=2&&v.length<=500000&&v.length%2===0&&/^[0-9a-fA-F]+$/.test(v)}
export async function POST(request:Request){
 let input:unknown;try{input=await request.json()}catch{return json({ok:false,error:"INVALID_JSON"},400)}
 if(!input||typeof input!=="object"||Array.isArray(input))return json({ok:false,error:"INVALID_REQUEST"},400)
 const b=input as Record<string,unknown>
 if(b.action==="prepare"){
  if(!pk(b.publicKey))return json({ok:false,error:"INVALID_PUBLIC_KEY"},400)
  if(!hash(b.postHash))return json({ok:false,error:"INVALID_POST_HASH"},400)
  if(!serial(b.serialNumber))return json({ok:false,error:"INVALID_SERIAL_NUMBER"},400)
  if(b.isForSale===true)return json({ok:false,error:"NFT_FOR_SALE"},400)
  if(b.isPending===true)return json({ok:false,error:"NFT_PENDING_TRANSFER"},400)
  const configured=Number(process.env.DESO_MIN_FEE_RATE_NANOS_PER_KB);const rate=Number.isFinite(configured)&&configured>0?Math.trunc(configured):DEFAULT_MIN_FEE_RATE_NANOS_PER_KB
  try{const r=await fetchDeSo("burn-nft",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({UpdaterPublicKeyBase58Check:b.publicKey,NFTPostHashHex:String(b.postHash).toLowerCase(),SerialNumber:b.serialNumber,MinFeeRateNanosPerKB:rate,TransactionFees:[]})});if(!r.ok)return json({ok:false,error:"DESO_BURN_PREPARE_REJECTED"},502);const d=await r.json() as Record<string,unknown>;if(!hex(d.TransactionHex))return json({ok:false,error:"INVALID_PREPARED_TRANSACTION"},502);return json({ok:true,transactionHex:d.TransactionHex,feeNanos:typeof d.FeeNanos==="number"?d.FeeNanos:null})}catch{return json({ok:false,error:"DESO_BURN_PREPARE_UNAVAILABLE"},503)}
 }
 if(b.action==="submit"){
  if(!hex(b.signedTransactionHex))return json({ok:false,error:"INVALID_SIGNED_TRANSACTION"},400)
  try{const r=await fetchDeSo("submit-transaction",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({TransactionHex:b.signedTransactionHex})});if(!r.ok)return json({ok:false,error:"DESO_BURN_SUBMIT_REJECTED"},502);return json({ok:true,transaction:await r.json()})}catch{return json({ok:false,error:"DESO_BURN_SUBMIT_UNAVAILABLE"},503)}
 }
 return json({ok:false,error:"INVALID_ACTION"},400)
}
