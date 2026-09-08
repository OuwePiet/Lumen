import RadioBrowser from "./radio-browser"

const styles = {
  main: {
    minHeight: "100vh",
    background: "#050807",
    color: "#f4f7f5",
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: "40px 20px 72px",
  },
  container: {
    width: "100%",
    maxWidth: "980px",
    margin: "0 auto",
  },
  top: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap" as const,
    marginBottom: "28px",
  },
  brand: {
    color: "#5cff9d",
    fontSize: "14px",
    fontWeight: 800,
    letterSpacing: "0.18em",
    textTransform: "uppercase" as const,
    margin: 0,
  },
  home: {
    color: "#b9ffd4",
    textDecoration: "none",
    border: "1px solid #285f40",
    borderRadius: "999px",
    padding: "9px 14px",
    minHeight: "44px",
    display: "inline-flex",
    alignItems: "center",
    fontSize: "13px",
    fontWeight: 800,
  },
  eyebrow: {
    color: "#5cff9d",
    fontSize: "13px",
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    margin: "0 0 12px",
  },
  heading: {
    fontSize: "clamp(34px, 7vw, 64px)",
    lineHeight: 1,
    margin: "0 0 16px",
  },
  intro: {
    color: "#a9b8af",
    fontSize: "17px",
    lineHeight: 1.65,
    maxWidth: "760px",
    margin: "0 0 28px",
  },
  notice: {
    marginTop: "22px",
    background: "#10261a",
    border: "1px solid #285f40",
    borderRadius: "14px",
    color: "#d7f7e3",
    padding: "16px",
    lineHeight: 1.55,
    fontSize: "14px",
  },
}

export default function WorldRadioPage() {
  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <div style={styles.top}>
          <p style={styles.brand}>VIA</p>
          <a href="/" style={styles.home}>Back to VIA</a>
        </div>

        <p style={styles.eyebrow}>World Radio</p>
        <h1 style={styles.heading}>Listen around the world.</h1>
        <p style={styles.intro}>
          Discover public internet radio by country or genre. Station metadata comes from the Radio Browser directory; when you press Play, audio is requested directly from the station and is not hosted or proxied by VIA.
        </p>

        <RadioBrowser />

        <div style={styles.notice}>
          World Radio is separate from VIA LIVE. Radio is for station listening; VIA LIVE is for community conversations and later replays. Availability and rights remain the responsibility of each station or stream provider.
        </div>
      </div>
    </main>
  )
}
