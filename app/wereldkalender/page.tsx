import Link from "next/link"
import { existsSync } from "node:fs"
import { join } from "node:path"

// @OuwePiet 2026: canonical public calendar. Previous calendar preserved at /wereldkalender/klassiek.
export const metadata = { title: "VIA Wereldkalender", description: "VIA wereldwijde kalender met landen, plaatsen en gebeurtenissen." }
export default function Wereldkalender() {
  const ready = existsSync(join(process.cwd(), "public", "wereldkalender19", "index.html"))
  return <main style={{minHeight:"100vh",background:"#07182e",color:"#f3e2b5"}}>
    <nav aria-label="Wereldkalender navigatie" style={{padding:"12px 20px",display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
      <Link href="/" style={{color:"inherit"}}>VIA Home</Link>
      <Link href="/mijn-agenda" style={{color:"inherit"}}>Mijn Agenda</Link>
      <Link href="/wereldkalender/klassiek" style={{color:"inherit"}}>Klassieke kalender</Link>
    </nav>
    {ready ? <iframe title="VIA Wereldkalender 19" src="/wereldkalender19/index.html" style={{display:"block",width:"100%",height:"max(520px, calc(100dvh - 54px))",border:0}} loading="eager" referrerPolicy="strict-origin-when-cross-origin" /> :
      <section role="status" style={{padding:24}}><p>De nieuwe kalender is tijdelijk niet beschikbaar.</p><Link href="/wereldkalender/klassiek" style={{color:"inherit"}}>Open de klassieke kalender</Link></section>}
  </main>
}