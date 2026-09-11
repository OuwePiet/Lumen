export default function ViaCollectionGalleryShell() {
  return (
    <section
      aria-labelledby="via-collections-heading"
      style={{
        borderTop: "1px solid rgba(143,212,169,.12)",
        marginTop: 18,
        padding: "18px 0 4px",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
        <h2
          id="via-collections-heading"
          style={{ margin: 0, fontSize: 16, fontWeight: 600, letterSpacing: ".02em" }}
        >
          Collections
        </h2>
        <span style={{ fontSize: 12, opacity: 0.58 }}>Creator-organized NFT galleries</span>
      </div>
      <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.55, opacity: 0.7 }}>
        Public creator collections will appear here when collection publication is connected.
        Existing DeSo NFT ownership remains unchanged.
      </p>
    </section>
  )
}
