import Link from "next/link"
import { fetchDeSo } from "../../deso-api"

export const dynamic = "force-dynamic"

type Entry={SerialNumber?:number}
type Post={Body?:string;ProfileEntryResponse?:{Username?:string}}
type Owned={PostEntryResponse?:Post;NFTEntryResponses?:Entry[]}
type Bid={PublicKeyBase58Check?:string;SerialNumber?:number;BidAmountNanos?:number}

function title(body?:string){const t=(body??"").replace(/https?:\/\/nftz\.me\/\S+/gi,"").replace(/\s+/g," ").trim();return t?(t.length>78?t.slice(0,75)+"...":t):"Untitled NFT"}
function deso(n?:number){return typeof n==="number"?new Intl.NumberFormat("en-US",{maximumFractionDigits:9}).format(n/1_000_000_000):"—"}
function shortKey(k?:string){return k&&k.length>22?k.slice(0,10)+"…"+k.slice(-8):(k??"Unknown bidder")}

export default async function ReceivedBidsPage({searchParams}:{searchParams:Promise<{publicKey?:string}>}){
 const {publicKey}=await searchParams
 let rows:Array<{hash:string;post:Post;serial:number;bidder:string;amount:number}>=[]
 let error=""
 if(publicKey){
  try{
   const ownedResponse=await fetchDeSo("get-nfts-for-user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({UserPublicKeyBase58Check:publicKey,ReaderPublicKeyBase58Check:publicKey,Limit:100}),cache:"no-store"})
   if(!ownedResponse.ok)throw new Error()
   const ownedData=await ownedResponse.json() as {NFTsMap?:Record<string,Owned>}
   const owned=Object.entries(ownedData.NFTsMap??{}).filter(([hash])=>/^[0-9a-fA-F]{64}$/.test(hash))
   const results=await Promise.all(owned.map(async([hash,record])=>{
    const serials=new Set((record.NFTEntryResponses??[]).map(e=>e.SerialNumber).filter((n):n is number=>typeof n==="number"))
    if(serials.size===0)return []
    const response=await fetchDeSo("get-nft-bids-for-nft-post",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ReaderPublicKeyBase58Check:publicKey,PostHashHex:hash}),cache:"no-store"})
    if(!response.ok)return []
    const data=await response.json() as {BidEntryResponses?:Bid[]}
    return (data.BidEntryResponses??[]).filter((b):b is Bid&{PublicKeyBase58Check:string;SerialNumber:number;BidAmountNanos:number}=>typeof b.PublicKeyBase58Check==="string"&&typeof b.SerialNumber==="number"&&serials.has(b.SerialNumber)&&typeof b.BidAmountNanos==="number"&&b.BidAmountNanos>0).map(b=>({hash,post:record.PostEntryResponse??{},serial:b.SerialNumber,bidder:b.PublicKeyBase58Check,amount:b.BidAmountNanos}))
   }))
   rows=results.flat().sort((a,b)=>b.amount-a.amount)
  }catch{error="VIA could not load received NFT bids for this DeSo account right now."}
 }
 const q=publicKey?"?publicKey="+encodeURIComponent(publicKey):""
 return <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 text-zinc-100">
  <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">VIA Marketplace</p><h1 className="mt-2 text-3xl font-semibold">Received bids</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Active native DeSo bids on NFT editions owned by this account. Open an NFT to review and accept a bid with VIA's guarded transaction flow.</p></div><Link href={"/market"+q} className="text-sm text-[#8fd4a9]">Back to Market</Link></div>
  {!publicKey?<form className="mt-8 rounded-xl border border-zinc-800 bg-black/20 p-4"><label className="text-sm text-zinc-300">DeSo public key<input name="publicKey" required placeholder="BC1…" className="mt-2 block w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm"/></label><button className="mt-3 rounded-lg border border-[#285f40] px-4 py-2 text-sm font-semibold text-[#9adbb2]">Show received bids</button></form>:error?<p className="mt-8 text-sm text-amber-300">{error}</p>:rows.length===0?<p className="mt-8 rounded-xl border border-zinc-800 p-5 text-sm text-zinc-400">No active received NFT bids found.</p>:<div className="mt-8 grid gap-3">{rows.map((r,i)=><Link key={r.hash+":"+r.serial+":"+r.bidder+":"+i} href={"/nft/"+r.hash+(publicKey?"?returnTo=received-bids&publicKey="+encodeURIComponent(publicKey):"")} className="rounded-xl border border-zinc-800 bg-black/20 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold">{title(r.post.Body)}</p><p className="mt-1 text-xs text-zinc-500">{r.post.ProfileEntryResponse?.Username?"@"+r.post.ProfileEntryResponse.Username+" · ":""}Edition #{r.serial} · {shortKey(r.bidder)}</p></div><p className="text-sm font-semibold text-[#9adbb2]">{deso(r.amount)} DESO</p></div></Link>)}</div>}
 </main>
}
