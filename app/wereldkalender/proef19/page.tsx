import Link from "next/link"
import { existsSync } from "node:fs"
import { join } from "node:path"

// VIA provenance: @OuwePiet2026. This marker is not a digital signature.
export const metadata = {
  title: "VIA Wereldkalender - werkversie 19 (proef)",
  robots: { index: false, follow: false },
}

/** Read-only preview route, separate from the existing VIA calendar. */
export default function Wereldkalender19Proef() {
  const hasSource = existsSync(join(process.cwd(), "public", "wereldkalender19", "index.html"))
  return (
    <main style={{ minHeight: "100vh", background: "#07182e", color: "#f3e2b5" }}>
      <nav style={{ padding: "12px 20px", display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
        <Link href="/" style={{ color: "inherit" }}>VIA Home</Link>
        <Link href="/wereldkalender" style={{ color: "inherit" }}>Huidige kalender</Link>
        <Link href="/mijn-agenda" style={{ color: "inherit" }}>Mijn Agenda</Link>
        <span style={{ marginLeft: "auto", fontSize: 13 }}>Werkversie 19 - proef</span>
      </nav>
      {hasSource ? (
        <iframe title="VIA Wereldkalender werkversie 19" src="/wereldkalender19/index.html"
          style={{ display: "block", width: "100%", height: "max(520px, calc(100dvh - 54px))", border: 0 }}
          loading="eager" referrerPolicy="strict-origin-when-cross-origin" />
      ) : (
        <section role="status" style={{ padding: "48px 24px", maxWidth: 760, margin: "0 auto" }}>
          <h1>Wereldkalender 19 - broncode nog niet geplaatst</h1>
          <p>De proefroute is voorbereid. De gecontroleerde index.html moet eerst in public/wereldkalender19/ staan voordat de kalender getest kan worden.</p>
          <p>De bestaande kalender blijft bereikbaar via de link hierboven.</p>
          <p style={{ fontSize: 12 }}>VIA herkomst: @OuwePiet2026</p>
        </section>
      )}
    </main>
  )
}
