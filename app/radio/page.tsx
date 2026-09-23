import RadioBrowser from "./radio-browser"
import RadioLocalizer from "./radio-localizer"

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
    color: "#8fd4a9",
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
    color: "#8fd4a9",
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
    <main style={styles.main} className="via-radio-page">
      <RadioLocalizer />
      <div style={styles.container} className="via-radio-page-container">
        <div style={styles.top} className="via-radio-page-top">
          <p style={styles.brand} className="via-radio-page-brand">VIA</p>
          <a href="/" style={styles.home} className="via-radio-page-home">Back to VIA</a>
        </div>

        <p style={styles.eyebrow}>World Radio</p>
        <h1 style={styles.heading} className="via-radio-page-heading">Listen around the world.</h1>
        <RadioBrowser />

        <style>{`\n          @media (max-width: 720px) {\n            .via-radio-page { padding: 14px 16px 96px !important; }
             .via-radio-page-top { margin-bottom: 8px !important; gap: 8px !important; }
            .via-radio-page-brand { font-size: 12px !important; }
            .via-radio-page-home { min-height: 36px !important; padding: 6px 10px !important; font-size: 11px !important; }\n             .via-radio-page-heading { font-size: clamp(28px, 9vw, 38px) !important; line-height: 1.02 !important; margin-bottom: 8px !important; overflow-wrap: anywhere; }\n             .via-radio-page-intro { font-size: 13px !important; line-height: 1.4 !important; margin-bottom: 12px !important; }
            .via-radio-page-notice { margin-top: 14px !important; padding: 10px 12px !important; font-size: 12px !important; line-height: 1.4 !important; }\n          }\n        `}</style>
      </div>
    </main>
  )
}
