"use client"
import Link from "next/link"
import { useEffect,useState } from "react"
import { ArrowLeftRight,Send,ShoppingCart } from "lucide-react"
import { restoreIdentitySession,type ViaIdentitySession } from "../../deso-identity-session"
type Mode="buy"|"sell"|"transfer"
export default function CreatorCoinPage(){
 const [session,setSession]=useState<ViaIdentitySession|null>(null),[mode,setMode]=useState<Mode>("buy")
 useEffect(()=>setSession(restoreIdentitySession()),[])
 const tabs:[Mode,string,typeof ShoppingCart][]=[["buy","Buy",ShoppingCart],["sell","Sell",ArrowLeftRight],["transfer","Transfer",Send]]
 return <main className="min-h-screen bg-[#050807] p-4 text-zinc-100"><section className="mx-auto max-w-md rounded-2xl border border-[#8fd4a9]/25 bg-[#0b1710] p-4">
  <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.16em] text-[#8fd4a9]">VIA · DeSo</p><h1 className="text-xl font-semibold">Creator Coin</h1></div><Link href="/profile" className="text-sm text-zinc-400">Close</Link></div>
  <div className="mt-5 grid grid-cols-3 gap-2">{tabs.map(([id,label,Icon])=><button key={id} onClick={()=>setMode(id)} className={"flex min-h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold "+(mode===id?"border-[#8fd4a9]/55 bg-[#10271a] text-[#9adbb2]":"border-zinc-800 bg-black/20 text-zinc-400")}><Icon className="h-4 w-4"/>{label}</button>)}</div>
  <div className="mt-5 rounded-xl border border-zinc-800 bg-black/20 p-4"><p className="text-sm font-semibold">{mode==="buy"?"Buy Creator Coin":mode==="sell"?"Sell Creator Coin":"Transfer Creator Coin"}</p><p className="mt-2 text-sm leading-6 text-zinc-400">{session?"Active DeSo account detected.":"Log in with DeSo Identity first."} The transaction controls remain locked until the native DeSo approval flow is connected and verified.</p></div>
  <button disabled className="mt-4 min-h-11 w-full rounded-xl border border-zinc-800 text-sm font-semibold text-zinc-600">Review in DeSo Identity</button>
 </section></main>
}