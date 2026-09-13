import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../../deso-api"
export const dynamic = "force-dynamic"
const DEFAULT_MIN_FEE_RATE_NANOS_PER_KB = 1000
function json(data: unknown, status = 200) { return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } }) }
function validPublicKey(v: unknown): v is string { return typeof v === "string" && v.length >= 40 && v.length <= 128 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(v) }
function validHash(v: unknown): v is string { return typeof v === "string" && /^[0-9a-fA-F]{64}$/.test(v) }
function validSerial(v: unknown): v is number { return typeof v === "number" && Number.isSafeInteger(v) && v > 0 }
function validHex(v: unknown): v is string { return typeof v === "string" && v.length >= 2 && v.length <= 500000 && v.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(v) }
export async function POST(request: Request) {
 let input: unknown; try { input = await request.json() } catch { return json({ok:false,error:"INVALID_JSON"},400) }
 if (!input || typeof input !== "object" || Array.isArray(input)) return json({ok:false,error:"INVALID_REQUEST"},400)
 const b=input as Record<string,unknown>
 if(b.action==="prepare"){
  if(!validPublicKey(b.publicKey)) return json({ok:false,error:"INVALID_PUBLIC_KEY"},400)
  if(!validHash(b.postHash)) return json({ok:false,error:"INVALID_POST_HASH"},400)
  if(!validSerial(b.serialNumber)) return json({ok:false,error:"INVALID_SERIAL_NUMBER"},400)
  const configured=Number(process.env.DESO_MIN_FEE_RATE_NANOS_PER_KB); const rate=Number.isFinite(configured)&&configured>0?Math.trunc(configured):DEFAULT_MIN_FEE_RATE_NANOS_PER_KB
  try{
   const response=await fetchDeSo("accept-nft-transfer",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({UpdaterPublicKeyBase58Check:b.publicKey,NFTPostHashHex:String(b.postHash).toLowerCase(),SerialNumber:b.serialNumber,MinFeeRateNanosPerKB:rate,TransactionFees:[]})})
   if(!response.ok) return json({ok:false,error:"DESO_ACCEPT_TRANSFER_PREPARE_REJECTED"},502)
   const data=await response.json() as Record<string,unknown>; if(!validHex(data.TransactionHex)) return json({ok:false,error:"INVALID_PREPARED_TRANSACTION"},502)
   return json({ok:true,transactionHex:data.TransactionHex,feeNanos:typeof data.FeeNanos==="number"?data.FeeNanos:null})
  }catch{return json({ok:false,error:"DESO_ACCEPT_TRANSFER_PREPARE_UNAVAILABLE"},503)}
 }
 if(b.action==="submit"){
  if(!validHex(b.signedTransactionHex)) return json({ok:false,error:"INVALID_SIGNED_TRANSACTION"},400)
  try{const response=await fetchDeSo("submit-transaction",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({TransactionHex:b.signedTransactionHex})}); if(!response.ok)return json({ok:false,error:"DESO_ACCEPT_TRANSFER_SUBMIT_REJECTED"},502); return json({ok:true,transaction:await response.json()})}catch{return json({ok:false,error:"DESO_ACCEPT_TRANSFER_SUBMIT_UNAVAILABLE"},503)}
 }
 return json({ok:false,error:"INVALID_ACTION"},400)
}
