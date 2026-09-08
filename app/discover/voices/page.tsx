import Link from "next/link"

const styles = {
  main: { minHeight: "100vh", background: "#020403", color: "#f4f7f5", padding: "24px 16px 56px" },
  shell: { width: "min(760px, 100%)", margin: "0 auto" },
  eyebrow: { color: "#78f0a8", fontWeight: 800, letterSpacing: "0.12em", fontSize: "12px" },
  title: { fontSize: "clamp(32px, 7vw, 58px)", lineHeight: 1, margin: "12px 0" },
  text: { color: "#b7c5bd", lineHeight: 1.65 },
  panel: { marginTop: "24px", border: "1px solid #285f40", borderRadius: "16px", background: "#08100b", padding: "18px" },
  form: { display: "flex", gap: "10px", flexWrap: "wrap" as const, marginTop: "16px" },
  input: { flex: "1 1 240px", minHeight: "44px", borderRadius: "12px", border: "1px solid #347d52", background: "#020403", color: "#f4f7f5", padding: "10px 12px", fontSize: "16px" },
  button: { minHeight: "44px", borderRadius: "999px", border: "1px solid #347d52", background: "#10261a", color: "#b9ffd4", padding: "9px 16px", fontWeight: 800, cursor: "pointer" },
  nav: { display: "flex", gap: "10px", flexWrap: "wrap" as const, marginTop: "24px" },
  link: { border: "1px solid #285f40", borderRadius: "999px", padding: "9px 14px", color: "#b9ffd4", textDecoration: "none", fontWeight: 800 },
}

export default function NewVoicesPage() {
  return (
    <main style={styles.main}>
      <div style={styles.shell}>
        <p style={styles.eyebrow}>VIA · NEW VOICES</p>
        <h1 style={styles.title}>Explore a public DeSo creator.</h1>
        <p style={styles.text}>
          This first New Voices step is user-directed and read-only. VIA does not label an account as new, important, verified, or organically ranked without suitable public evidence.
        </p>

        <section style={styles.panel} aria-label="Open a public creator">
          <h2>Open creator collection</h2>
          <p style={styles.text}>Enter a public DeSo username. VIA opens the existing public collection browser; no signing, follow, like, payment, or Diamond action is performed.</p>
          <form action="/" method="get" style={styles.form}>
            <input name="account" aria-label="DeSo username" placeholder="DeSo username" autoComplete="off" style={styles.input} />
            <button type="submit" style={styles.button}>Explore creator</button>
          </form>
        </section>

        <nav aria-label="New Voices navigation" style={styles.nav}>
          <Link href="/discover" style={styles.link}>World Discovery</Link>
          <Link href="/" style={styles.link}>Home</Link>
        </nav>
      </div>
    </main>
  )
}
