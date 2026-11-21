import Link from "next/link"

export const metadata = {
  title: "VIA - Wereldkalender en WereldSpiegel (lokale proef)",
  robots: { index: false, follow: false },
}

export default function ViaKalenderKrantProef() {
  return <main style={{minHeight:"100vh",background:"#07182e",color:"#f3e2b5",padding:"clamp(18px,5vw,52px)",fontFamily:"system-ui,sans-serif"}}>
    <Link href="/" style={{color:"#f3e2b5"}}>VIA Home</Link>
    <h1>VIA - Wereldkalender en WereldSpiegel</h1>
    <p>Geisoleerde lokale controle van bestaande ontwerpen. Geen productiepublicatie.</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,290px),1fr))",gap:20,maxWidth:960,marginTop:24}}>
      <section style={{border:"1px solid #b99859",borderRadius:10,padding:20}}>
        <h2>Wereldkalender 19</h2>
        <p>Wereldbol, gebeurtenissen, landen en plaatszoekfunctie. Lokale GEO-zoekproef voor 253 landen.</p>
        <Link href="/wereldkalender/proef19" style={{color:"#f3e2b5"}}>Open kalenderproef</Link>
      </section>
      <section style={{border:"1px solid #b99859",borderRadius:10,padding:20}}>
        <h2>De WereldSpiegel</h2>
        <p>Oorspronkelijke bewaarde krant. Artikelen zijn duidelijk fictieve demonstraties; geen live nieuws.</p>
        <Link href="/wereldspiegel-proef" style={{color:"#f3e2b5"}}>Open krantenproef</Link>
      </section>
    </div>
    <section style={{border:"1px solid #b99859",borderRadius:10,padding:20,maxWidth:960,marginTop:20}}>
      <h2>Mijn Agenda</h2>
      <p>Eigen afspraken, lokaal versleuteld bewaren met wachtzin en handmatige agenda-export. Geen automatische synchronisatie.</p>
      <Link href="/mijn-agenda" style={{color:"#f3e2b5"}}>Open Mijn Agenda</Link>
    </section>    <p style={{marginTop:28}}>De bestaande /wereldkalender blijft onaangeroerd. Deze proef is niet voor zoekmachines bedoeld.</p>
  </main>
}
