import Link from "next/link"
import { existsSync } from "node:fs"
import { join } from "node:path"

// @OuwePiet 2026: canonical public calendar. Previous calendar preserved at /wereldkalender/klassiek.
export const metadata = { title: "VIA Wereldkalender", description: "VIA wereldwijde kalender met landen, plaatsen en gebeurtenissen." }
export default function Wereldkalender() {
  const ready = existsSync(join(process.cwd(), "public", "wereldkalender19", "index.html"))
  return <main style={{minHeight:"100vh",background:"#07182e",color:"#f3e2b5"}}>

    {ready ? <iframe title="VIA Wereldkalender 19" src="/wereldkalender19/index.html" style={{display:"block",width:"100%",height:"max(520px, calc(100dvh - 54px))",border:0}} loading="eager" referrerPolicy="strict-origin-when-cross-origin" /> :
      <section role="status" style={{padding:24}}><p>De nieuwe kalender is tijdelijk niet beschikbaar.</p><Link href="/wereldkalender/klassiek" style={{color:"inherit"}}>Open de klassieke kalender</Link></section>}
  </main>
}