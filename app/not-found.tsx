import Link from "next/link"

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#050807",
    color: "#f4f7f5",
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: "40px 20px",
  },
  panel: {
    width: "min(100%, 560px)",
    background: "#0c120f",
    border: "1px solid #254233",
    borderRadius: "18px",
    padding: "28px",
  },
  brand: {
    color: "#5cff9d",
    fontSize: "14px",
    fontWeight: 700,
    letterSpacing: "0.18em",
    margin: "0 0 12px",
  },
  heading: {
    fontSize: "clamp(26px, 5vw, 40px)",
    lineHeight: 1.1,
    margin: "0 0 14px",
  },
  message: {
    color: "#a9b8af",
    fontSize: "16px",
    lineHeight: 1.6,
    margin: "0 0 22px",
  },
  link: {
    display: "inline-block",
    color: "#050807",
    background: "#5cff9d",
    border: "1px solid #5cff9d",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: 800,
    padding: "10px 16px",
    textDecoration: "none",
  },
}

export default function NotFound() {
  return (
    <main style={styles.page}>
      <section style={styles.panel}>
        <p style={styles.brand}>VIA</p>
        <h1 style={styles.heading}>This NFT page was not found.</h1>
        <p style={styles.message}>
          The link may be incomplete or the NFT is not available through this
          address. Nothing has been changed.
        </p>
        <Link href="/" style={styles.link}>
          Back to the NFT collection
        </Link>
      </section>
    </main>
  )
}
