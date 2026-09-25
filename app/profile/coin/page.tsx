"use client"
import Link from "next/link"
import { useEffect,useState } from "react"
import { ArrowLeftRight,Send,ShoppingCart } from "lucide-react"
import { restoreIdentitySession,type ViaIdentitySession } from "../../deso-identity-session"
type Mode="buy"|"sell"|"transfer"
type CoinData={username:string;coinPriceDeSoNanos:number|null;numberOfHolders:number|null;coinsInCirculationNanos:number|null}
type WalletData={balanceDeSo:number;creatorCoinHoldings:Array<{creatorPublicKey:string;balanceCoins:number}>}
const n=(v:number|null,d=4)=>v===null?"—":new Intl.NumberFormat("en-US",{maximumFractionDigits:d}).format(v)
export default function CreatorCoinPage(){
 const [session,setSession]=useState<ViaIdentitySession|null>(null),[mode,setMode]=useState<Mode>("buy"),[coin,setCoin]=useState<CoinData|null>(null),[wallet,setWallet]=useState<WalletData|null>(null)
 useEffect(()=>{const s=restoreIdentitySession();setSession(s);if(!s)return;Promise.all([fetch("/api/via/profile?identity="+encodeURIComponent(s.publicKey),{cache:"no-store"}).then(r=>r.json()),fetch("/api/via/wallet?publicKey="+encodeURIComponent(s.publicKey),{cache:"no-store"}).then(r=>r.json())]).then(([p,w])=>{if(p?.profile)setCoin(p.profile);if(w?.wallet)setWallet(w.wallet)}).catch(()=>{})},[])
 const tabs:[Mode,string,typeof ShoppingCart][]=[["buy","Buy",ShoppingCart],["sell","Sell",ArrowLeftRight],["transfer","Transfer",Send]]
 const ownHolding=wallet&&session?wallet.creatorCoinHoldings.find(h=>h.creatorPublicKey===session.publicKey)?.balanceCoins??0:0
 return <main className="min-h-screen bg-[#050807] p-4 text-zinc-100"><section className="mx-auto max-w-md rounded-2xl border border-[#8fd4a9]/25 bg-[#0b1710] p-4">
  <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.16em] text-[#8fd4a9]">VIA · DeSo</p><h1 className="text-xl font-semibold">{coin?.username?coin.username+"’s Coin":"Creator Coin"}</h1></div><Link href="/profile" className="text-sm text-zinc-400">Close</Link></div>
  <div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl border border-zinc-800 bg-black/20 p-3"><span className="text-zinc-500">DESO available</span><strong className="mt-1 block text-sm">{wallet?n(wallet.balanceDeSo):"—"} DESO</strong></div><div className="rounded-xl border border-zinc-800 bg-black/20 p-3"><span className="text-zinc-500">Your coin balance</span><strong className="mt-1 block text-sm">{n(ownHolding)} coins</strong></div><div className="rounded-xl border border-zinc-800 bg-black/20 p-3"><span className="text-zinc-500">Coin price</span><strong className="mt-1 block text-sm">{coin?.coinPriceDeSoNanos!=null?n(coin.coinPriceDeSoNanos/1e9)+" DESO":"—"}</strong></div><div className="rounded-xl border border-zinc-800 bg-black/20 p-3"><span className="text-zinc-500">Holders</span><strong className="mt-1 block text-sm">{coin?.numberOfHolders!=null?n(coin.numberOfHolders,0):"—"}</strong></div></div>
  <div className="mt-5 grid grid-cols-3 gap-2">{tabs.map(([id,label,Icon])=><button key={id} onClick={()=>setMode(id)} className={"flex min-h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold "+(mode===id?"border-[#8fd4a9]/55 bg-[#10271a] text-[#9adbb2]":"border-zinc-800 bg-black/20 text-zinc-400")}><Icon className="h-4 w-4"/>{label}</button>)}</div>
  <div className="mt-5 rounded-xl border border-zinc-800 bg-black/20 p-4"><p className="text-sm font-semibold">{mode==="buy"?"Buy Creator Coin":mode==="sell"?"Sell Creator Coin":"Transfer Creator Coin"}</p><p className="mt-2 text-sm leading-6 text-zinc-400">{session?"Live public DeSo balances loaded above when available.":"Log in with DeSo Identity first."} Transaction execution remains locked until the native approval flow is verified.</p></div>
  <button disabled className="mt-4 min-h-11 w-full rounded-xl border border-zinc-800 text-sm font-semibold text-zinc-600">Review in DeSo Identity</button>
 </section></main>
}