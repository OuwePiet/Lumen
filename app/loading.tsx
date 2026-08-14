const styles = {
  page: {
    minHeight: "100vh",
    background: "#050807",
    color: "#f4f7f5",
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: "40px 20px 72px",
  },
  container: {
    width: "100%",
    maxWidth: "1120px",
    margin: "0 auto",
  },
  brand: {
    color: "#5cff9d",
    fontSize: "14px",
    fontWeight: 700,
    letterSpacing: "0.18em",
    margin: "0 0 10px",
    textTransform: "uppercase" as const,
  },
  heading: {
    fontSize: "clamp(30px, 5vw, 52px)",
    lineHeight: 1.05,
    margin: "0 0 12px",
  },
  status: {
    color: "#b9ffd4",
    fontSize: "14px",
    fontWeight: 700,
    margin: "0 0 28px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px",
  },
  card: {
    overflow: "hidden",
    background: "#0c120f",
    border: "1px solid #254233",
    borderRadius: "18px",
  },
  media: {
    aspectRatio: "1 / 1",
    background: "#0a120e",
    borderBottom: "1px solid #254233",
  },
  content: {
    padding: "20px",
  },
  line: {
    height: "14px",
    background: "#173024",
    borderRadius: "999px",
    marginBottom: "12px",
  },
}

export default function Loading() {
  return (
    <main style={styles.page} aria-busy="true" aria-live="polite">
      <div style={styles.container}>
        <p style={styles.brand}>Lumen</p>
        <h1 style={styles.heading}>NFT collection</h1>
        <p style={styles.status}>Loading NFT collection from DeSo…</p>

        <div style={styles.grid} aria-label="Loading NFT cards">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} style={styles.card} aria-hidden="true">
              <div style={styles.media} />
              <div style={styles.content}>
                <div style={{ ...styles.line, width: "38%" }} />
                <div style={{ ...styles.line, width: "82%" }} />
                <div style={{ ...styles.line, width: "58%", marginBottom: 0 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
