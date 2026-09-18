import accessibilityStyles from "./accessibility.module.css"
import CollectionBrowser from "./collection-browser"
import CollectionLocalizedText from "./collection-localized-text"
import { fetchDeSo } from "./deso-api"
import MediaFilter, { type MediaFilterType } from "./media-filter"
import NFTMedia from "./nft-media"
import ViaWatermark from "./via-watermark"

type DeSoPost = {
  PostHashHex?: string
  Body?: string
  ImageURLs?: string[]
  VideoURLs?: string[]
  NumNFTCopies?: number
  IsNFT?: boolean
  ProfileEntryResponse?: { Username?: string }
}

type NFTEntry = {
  IsForSale?: boolean
  BuyNowPriceNanos?: number
  MinBidAmountNanos?: number
}

type DeSoProfile = { Username?: string; PublicKeyBase58Check?: string }

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".m4v"]
const AUDIO_EXTENSIONS = [".mp3", ".wav", ".m4a", ".aac", ".flac", ".oga"]
const MAX_AUTOMATIC_NFTS_DISPLAYED = 50

function mediaFilterType(post: DeSoPost): MediaFilterType {
  const videoUrl = post.VideoURLs?.[0]
  const mediaUrl = videoUrl ?? post.ImageURLs?.[0]
  if (!mediaUrl) return "unavailable"
  const path = mediaUrl.split(/[?#]/, 1)[0].toLowerCase()
  if (AUDIO_EXTENSIONS.some((extension) => path.endsWith(extension))) return "audio"
  if (videoUrl || VIDEO_EXTENSIONS.some((extension) => path.endsWith(extension))) return "video"
  return "image"
}

async function loadCollectionOwner(username: string) {
  const response = await fetchDeSo("get-single-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Username: username }),
    cache: "no-store",
  })
  if (!response.ok) return null
  const data = await response.json()
  const profile: DeSoProfile = data.Profile ?? data.ProfileEntryResponse ?? {}
  if (!profile.Username || !profile.PublicKeyBase58Check) return null
  return profile
}

async function loadAutomaticNFTCount(publicKey: string) {
  let lastPostHashHex = ""
  let checkedPosts = 0
  let nftCount = 0
  const discoveredNFTPostHashes: string[] = []
  for (let page = 0; page < 20; page += 1) {
    const response = await fetchDeSo("get-posts-for-public-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        PublicKeyBase58Check: publicKey,
        ReaderPublicKeyBase58Check: "",
        LastPostHashHex: lastPostHashHex,
        NumToFetch: 12,
        MediaRequired: false,
      }),
      cache: "no-store",
    })
    if (!response.ok) return null
    const data = await response.json()
    const posts: DeSoPost[] = data.Posts ?? []
    if (posts.length === 0) break
    checkedPosts += posts.length
    const nftPosts = posts.filter((post) => post.IsNFT === true)
    nftCount += nftPosts.length
    for (const post of nftPosts) {
      if (discoveredNFTPostHashes.length < MAX_AUTOMATIC_NFTS_DISPLAYED && post.PostHashHex && !discoveredNFTPostHashes.includes(post.PostHashHex)) {
        discoveredNFTPostHashes.push(post.PostHashHex)
      }
    }
    if (posts.length < 12) break
    const lastPost = posts[posts.length - 1]
    if (!lastPost.PostHashHex) break
    lastPostHashHex = lastPost.PostHashHex
  }
  return { nftCount, checkedPosts, discoveredNFTPostHashes }
}

async function loadNFT(postHash: string) {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ PostHashHex: postHash, ReaderPublicKeyBase58Check: "" }),
    cache: "no-store" as const,
  }
  const [postResponse, nftResponse] = await Promise.all([
    fetchDeSo("get-single-post", requestOptions),
    fetchDeSo("get-nft-entries-for-nft-post", requestOptions),
  ])
  if (!postResponse.ok || !nftResponse.ok) return null
  const [postData, nftData] = await Promise.all([postResponse.json(), nftResponse.json()])
  const post: DeSoPost = postData.PostFound ?? postData.PostFoundResponse ?? {}
  const entries: NFTEntry[] = nftData.NFTEntryResponses ?? nftData.NFTEntries ?? nftData.NFTEntryResponse ?? []
  const forSaleCount = entries.filter((entry) => entry.IsForSale).length
  const buyNowPrices = entries.filter((entry) => entry.IsForSale).map((entry) => entry.BuyNowPriceNanos).filter((price): price is number => typeof price === "number" && price > 0)
  const lowestBuyNowPrice = buyNowPrices.length > 0 ? Math.min(...buyNowPrices) : undefined
  const minBidAmounts = entries.filter((entry) => entry.IsForSale).map((entry) => entry.MinBidAmountNanos).filter((amount): amount is number => typeof amount === "number" && amount > 0)
  const lowestMinBidAmount = minBidAmounts.length > 0 ? Math.min(...minBidAmounts) : undefined
  return { postHash, post, forSaleCount, lowestBuyNowPrice, lowestMinBidAmount }
}

function cardTitle(body?: string) {
  if (!body) return "DeSo NFT"
  const cleaned = body.replace(/https?:\/\/nftz\.me\/\S+/gi, "").replace(/\s+/g, " ").trim()
  if (!cleaned) return "DeSo NFT"
  return cleaned.length > 72 ? `${cleaned.slice(0, 69)}...` : cleaned
}

const styles = {
  section: { minHeight: "100vh", background: "#050807", color: "#f4f7f5", fontFamily: "Arial, Helvetica, sans-serif", padding: "28px 20px 72px" },
  container: { width: "100%", maxWidth: "1120px", margin: "0 auto" },
  brandRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "18px", marginBottom: "26px", flexWrap: "wrap" as const },
  brandLockup: { display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" },
  brandMark: { display: "grid", placeItems: "center", width: "38px", height: "38px", border: "1px solid rgba(143,212,169,.32)", borderRadius: "12px", color: "#9adbb2", background: "rgba(12,23,17,.45)", fontSize: "15px", fontWeight: 800, letterSpacing: "0.08em" },
  brandText: { display: "grid", gap: "2px" },
  brand: { color: "#9adbb2", fontSize: "14px", fontWeight: 800, letterSpacing: "0.16em", margin: 0, textTransform: "uppercase" as const },
  domain: { color: "#76837b", fontSize: "11px", letterSpacing: "0.08em", margin: 0 },
  nav: { display: "flex", flexWrap: "wrap" as const, gap: "8px", justifyContent: "flex-end" },
  navLink: { minHeight: "40px", display: "inline-flex", alignItems: "center", color: "#c1cbc5", background: "transparent", border: "1px solid rgba(113,130,120,.58)", borderRadius: "11px", fontSize: "12px", fontWeight: 700, padding: "7px 12px", textDecoration: "none", transition: "background-color 200ms ease-out, border-color 200ms ease-out, color 200ms ease-out" },
  heading: { fontSize: "clamp(27px, 4vw, 44px)", lineHeight: 1.08, margin: "0 0 10px", letterSpacing: "-0.02em" },
  introduction: { color: "#9ba9a0", fontSize: "15px", lineHeight: 1.6, margin: "0 0 30px", maxWidth: "760px" },
  owner: { color: "#8fd4a9", fontSize: "13px", fontWeight: 700, lineHeight: 1.7, margin: "-12px 0 30px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px" },
  card: { display: "block", overflow: "hidden", color: "inherit", background: "rgba(9,13,11,.72)", border: "1px solid rgba(63,74,68,.72)", borderRadius: "14px", textDecoration: "none" },
  mediaFrame: { position: "relative" as const, width: "100%", aspectRatio: "1 / 1", overflow: "hidden", background: "#070b09", borderBottom: "1px solid rgba(63,74,68,.72)" },
  image: { display: "block", width: "100%", height: "100%", objectFit: "cover" as const, background: "#070b09" },
  placeholder: { display: "grid", width: "100%", height: "100%", placeItems: "center", color: "#84958b", background: "#070b09" },
  content: { padding: "18px" },
  badge: { display: "inline-block", color: "#92d7ab", background: "rgba(12,23,17,.45)", border: "1px solid rgba(143,212,169,.28)", borderRadius: "999px", fontSize: "11px", fontWeight: 700, padding: "5px 9px", marginBottom: "12px" },
  title: { fontSize: "17px", lineHeight: 1.4, margin: "0 0 16px", fontWeight: 600 },
  facts: { display: "flex", justifyContent: "space-between", gap: "16px", color: "#9daaa3", fontSize: "13px", lineHeight: 1.5, flexWrap: "wrap" as const },
}

export default async function NFTGrid({ initialAccount }: { initialAccount?: string }) {
  const selectedAccount = initialAccount?.trim().replace(/^@/, "") || "OuwePiet"
  const collectionOwner = await loadCollectionOwner(selectedAccount)
  const automaticNFTResult = collectionOwner ? await loadAutomaticNFTCount(collectionOwner.PublicKeyBase58Check!) : null
  const discoveredResults = automaticNFTResult ? await Promise.all(automaticNFTResult.discoveredNFTPostHashes.map(loadNFT)) : []
  const collectionNFTs = discoveredResults.filter((result): result is NonNullable<Awaited<ReturnType<typeof loadNFT>>> => result !== null)

  const renderNFTCard = ({ postHash, post, forSaleCount, lowestBuyNowPrice, lowestMinBidAmount }: NonNullable<Awaited<ReturnType<typeof loadNFT>>>) => {
    const creatorUsername = post.ProfileEntryResponse?.Username
    const creator = creatorUsername ? `@${creatorUsername}` : "DeSo creator"
    return (
      <a key={postHash} href={`/nft/${postHash}`} aria-label={`Open NFT: ${cardTitle(post.Body)} by ${creator}`} style={styles.card}>
        <div style={styles.mediaFrame}>
          <NFTMedia imageUrl={post.ImageURLs?.[0]} videoUrl={post.VideoURLs?.[0]} alt={cardTitle(post.Body)} imageStyle={styles.image} placeholderStyle={styles.placeholder} />
          <ViaWatermark />
        </div>
        <div style={styles.content}>
          <span style={styles.badge}><CollectionLocalizedText kind="onChain" /></span>
          <h2 style={styles.title}>{cardTitle(post.Body)}</h2>
          <div style={styles.facts}>
            <span>{creatorUsername ? `@${creatorUsername}` : <CollectionLocalizedText kind="creator" />}</span>
            <span><CollectionLocalizedText kind="cardFacts" copies={post.NumNFTCopies ?? 0} forSaleCount={forSaleCount} buyNowPrice={lowestBuyNowPrice} minBidAmount={lowestMinBidAmount} /></span>
          </div>
        </div>
      </a>
    )
  }

  return (
    <main id="main-content" style={styles.section}>
      <a className={accessibilityStyles.skipLink} href="#collection-controls">Skip to collection controls</a>
      <div style={styles.container}>
        <h1 style={styles.heading}><CollectionLocalizedText kind="heading" /></h1>
        <p style={styles.introduction}><CollectionLocalizedText kind="intro" /></p>
        <CollectionBrowser initialAccount={initialAccount}>
          <>
            <p style={styles.owner}>
              <CollectionLocalizedText
                kind="ownerStatus"
                username={collectionOwner?.Username}
                displayedCount={collectionNFTs.length}
                detectedCount={automaticNFTResult?.nftCount}
                selectedAccount={selectedAccount}
              />
            </p>
            <div id="collection-controls">
              <MediaFilter
                mediaTypes={collectionNFTs.map(({ post }) => mediaFilterType(post))}
                saleStatuses={collectionNFTs.map(({ forSaleCount }) => forSaleCount > 0 ? "for-sale" : "not-for-sale")}
                sortData={collectionNFTs.map(({ postHash, post, forSaleCount, lowestBuyNowPrice, lowestMinBidAmount }) => ({
                  title: cardTitle(post.Body),
                  creator: post.ProfileEntryResponse?.Username ? `@${post.ProfileEntryResponse.Username}` : "DeSo creator",
                  price: lowestBuyNowPrice ?? lowestMinBidAmount,
                  searchText: [post.Body ?? "", postHash, forSaleCount > 0 ? "for sale te koop" : "not for sale niet te koop", mediaFilterType(post)].join(" "),
                }))}
                gridStyle={styles.grid}
              >
                {collectionNFTs.map(renderNFTCard)}
              </MediaFilter>
            </div>
          </>
        </CollectionBrowser>
      </div>
    </main>
  )
}