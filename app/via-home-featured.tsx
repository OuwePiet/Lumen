import Link from "next/link"
import { fetchDeSo } from "./deso-api"

type DeSoProfile = { PublicKeyBase58Check?: string }
type DeSoPost = {
  PostHashHex?: string
  Body?: string
  ImageURLs?: string[]
  IsNFT?: boolean
  ProfileEntryResponse?: { Username?: string }
}

function safeHttps(value?: string) {
  if (!value) return undefined
  try {
    const parsed = new URL(value)
    return parsed.protocol === "https:" ? parsed.toString() : undefined
  } catch {
    return undefined
  }
}

function titleFromBody(body?: string) {
  const cleaned = (body ?? "").replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim()
  if (!cleaned) return "DeSo NFT"
  return cleaned.length > 34 ? `${cleaned.slice(0, 31)}…` : cleaned
}

async function loadFeatured() {
  try {
    const profileResponse = await fetchDeSo("get-single-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Username: "OuwePiet" }),
      cache: "no-store",
    })
    if (!profileResponse.ok) return []
    const profileData = await profileResponse.json()
    const profile: DeSoProfile = profileData.Profile ?? profileData.ProfileEntryResponse ?? {}
    if (!profile.PublicKeyBase58Check) return []

    const postsResponse = await fetchDeSo("get-posts-for-public-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        PublicKeyBase58Check: profile.PublicKeyBase58Check,
        ReaderPublicKeyBase58Check: "",
        LastPostHashHex: "",
        NumToFetch: 24,
        MediaRequired: false,
      }),
      cache: "no-store",
    })
    if (!postsResponse.ok) return []
    const postsData = await postsResponse.json()
    const posts: DeSoPost[] = postsData.Posts ?? []
    return posts
      .filter((post) => post.IsNFT === true && post.PostHashHex && safeHttps(post.ImageURLs?.[0]))
      .slice(0, 6)
  } catch {
    return []
  }
}

const styles = {
  section: { marginTop: "34px", position: "relative" as const, zIndex: 4 },
  head: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "14px" },
  title: { margin: 0, fontSize: "18px", color: "#9adbb2", fontWeight: 650 },
  viewAll: { color: "#c2cbc6", textDecoration: "none", fontSize: "12px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" },
  card: { display: "block", minWidth: 0, border: "1px solid rgba(90,112,101,.35)", borderRadius: "12px", overflow: "hidden", background: "rgba(4,8,6,.82)", color: "inherit", textDecoration: "none" },
  media: { position: "relative" as const, aspectRatio: "1 / 1", overflow: "hidden", background: "#080c0a" },
  image: { width: "100%", height: "100%", objectFit: "cover" as const, display: "block", filter: "saturate(.78) contrast(1.03)" },
  leaf: { position: "absolute" as const, right: "8px", top: "8px", width: "24px", height: "24px", opacity: .8, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.45))" },
  body: { padding: "10px 11px 11px" },
  nftTitle: { display: "block", color: "#eef3f0", fontSize: "13px", fontWeight: 650, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
  creator: { display: "block", marginTop: "4px", color: "#7f9187", fontSize: "11px" },
  empty: { border: "1px solid rgba(90,112,101,.28)", borderRadius: "12px", padding: "18px", color: "#7f9187", fontSize: "12px", background: "rgba(4,8,6,.55)" },
}

export default async function ViaHomeFeatured() {
  const posts = await loadFeatured()

  return (
    <section style={styles.section} aria-labelledby="via-featured-heading">
      <div style={styles.head}>
        <h2 id="via-featured-heading" style={styles.title}>Featured on VIA</h2>
        <Link href="/collection" style={styles.viewAll}>View all →</Link>
      </div>
      {posts.length > 0 ? (
        <div style={styles.grid}>
          {posts.map((post) => {
            const imageUrl = safeHttps(post.ImageURLs?.[0])!
            const creator = post.ProfileEntryResponse?.Username ? `@${post.ProfileEntryResponse.Username}` : "DeSo creator"
            return (
              <Link key={post.PostHashHex} href={`/nft/${post.PostHashHex}`} style={styles.card}>
                <div style={styles.media}>
                  <img src={imageUrl} alt={titleFromBody(post.Body)} style={styles.image} loading="lazy" referrerPolicy="no-referrer" />
                  <img src="/via-leaf.svg" alt="" style={styles.leaf} />
                </div>
                <span style={styles.body}>
                  <span style={styles.nftTitle}>{titleFromBody(post.Body)}</span>
                  <span style={styles.creator}>{creator}</span>
                </span>
              </Link>
            )
          })}
        </div>
      ) : (
        <div style={styles.empty}>Featured DeSo NFTs are temporarily unavailable. The NFT collection remains available.</div>
      )}
    </section>
  )
}
