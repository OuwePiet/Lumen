import NFTMedia from "./nft-media"

const DESO_NODE = "https://node.deso.org"

const NFT_POST_HASHES = [
  "000929e4490e3f744a7c889738d3aef52397ac72af906e5cd473bde710b49111",
  "267cd00db324d831b35722da8e5cc8895b9b0da610d5e384b4578e49f8319e84",
]

type DeSoPost = {
  PostHashHex?: string
  Body?: string
  ImageURLs?: string[]
  NumNFTCopies?: number
  IsNFT?: boolean
  ProfileEntryResponse?: {
    Username?: string
  }
}

type NFTEntry = {
  IsForSale?: boolean
  BuyNowPriceNanos?: number
  MinBidAmountNanos?: number
}

type DeSoProfile = {
  Username?: string
  PublicKeyBase58Check?: string
}

async function loadCollectionOwner() {
  const response = await fetch(`${DESO_NODE}/api/v0/get-single-profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Username: "OuwePiet" }),
    cache: "no-store",
  })

  if (!response.ok) return null

  const data = await response.json()
  const profile: DeSoProfile =
    data.Profile ?? data.ProfileEntryResponse ?? {}

  if (!profile.Username || !profile.PublicKeyBase58Check) return null

  return profile
}

async function loadAutomaticNFTCount(publicKey: string) {
  let lastPostHashHex = ""
  let checkedPosts = 0
  let nftCount = 0
  const discoveredNFTPostHashes: string[] = []

  for (let page = 0; page < 20; page += 1) {
    const response = await fetch(
      `${DESO_NODE}/api/v0/get-posts-for-public-key`,
      {
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
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    const posts: DeSoPost[] = data.Posts ?? []

    if (posts.length === 0) break

    checkedPosts += posts.length
    const nftPosts = posts.filter((post) => post.IsNFT === true)
    nftCount += nftPosts.length
    for (const post of nftPosts) {
      if (
        discoveredNFTPostHashes.length < 12 &&
        post.PostHashHex &&
        !NFT_POST_HASHES.includes(post.PostHashHex) &&
        !discoveredNFTPostHashes.includes(post.PostHashHex)
      ) {
        discoveredNFTPostHashes.push(post.PostHashHex)
      }
    }

    if (posts.length < 12) break

    const lastPost = posts[posts.length - 1] as DeSoPost & {
      PostHashHex?: string
    }

    if (!lastPost.PostHashHex) break
    lastPostHashHex = lastPost.PostHashHex
  }

  return { nftCount, checkedPosts, discoveredNFTPostHashes }
}

async function loadNFT(postHash: string) {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      PostHashHex: postHash,
      ReaderPublicKeyBase58Check: "",
    }),
    cache: "no-store" as const,
  }

  const [postResponse, nftResponse] = await Promise.all([
    fetch(`${DESO_NODE}/api/v0/get-single-post`, requestOptions),
    fetch(
      `${DESO_NODE}/api/v0/get-nft-entries-for-nft-post`,
      requestOptions
    ),
  ])

  if (!postResponse.ok || !nftResponse.ok) return null

  const [postData, nftData] = await Promise.all([
    postResponse.json(),
    nftResponse.json(),
  ])

  const post: DeSoPost =
    postData.PostFound ?? postData.PostFoundResponse ?? {}

  const entries: NFTEntry[] =
    nftData.NFTEntryResponses ??
    nftData.NFTEntries ??
    nftData.NFTEntryResponse ??
    []

  const forSaleCount = entries.filter(
    (entry) => entry.IsForSale
  ).length

  const buyNowPrices = entries
    .filter((entry) => entry.IsForSale)
    .map((entry) => entry.BuyNowPriceNanos)
    .filter(
      (price): price is number =>
        typeof price === "number" && price > 0
    )

  const lowestBuyNowPrice =
    buyNowPrices.length > 0 ? Math.min(...buyNowPrices) : undefined

  const minBidAmounts = entries
    .filter((entry) => entry.IsForSale)
    .map((entry) => entry.MinBidAmountNanos)
    .filter(
      (amount): amount is number =>
        typeof amount === "number" && amount > 0
    )

  const lowestMinBidAmount =
    minBidAmounts.length > 0 ? Math.min(...minBidAmounts) : undefined

  return {
    postHash,
    post,
    forSaleCount,
    lowestBuyNowPrice,
    lowestMinBidAmount,
  }
}

function formatDeSo(nanos: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 9,
  }).format(nanos / 1_000_000_000)
}

function priceStatus(
  forSaleCount: number,
  buyNowPrice?: number,
  minBidAmount?: number
) {
  if (forSaleCount === 0) return "Not for sale"

  if (typeof buyNowPrice === "number") {
    return `Buy now: ${formatDeSo(buyNowPrice)} DESO`
  }

  if (typeof minBidAmount === "number") {
    return `Min bid: ${formatDeSo(minBidAmount)} DESO`
  }

  return "Claim not available"
}

function cardTitle(body?: string) {
  if (!body) return "DeSo NFT"

  const cleaned = body
    .replace(/https?:\/\/nftz\.me\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim()

  if (!cleaned) return "DeSo NFT"

  return cleaned.length > 72
    ? `${cleaned.slice(0, 69)}...`
    : cleaned
}

const styles = {
  section: {
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
  introduction: {
    color: "#a9b8af",
    fontSize: "16px",
    lineHeight: 1.6,
    margin: "0 0 32px",
  },
  owner: {
    color: "#5cff9d",
    fontSize: "14px",
    fontWeight: 700,
    margin: "-16px 0 32px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px",
  },
  card: {
    display: "block",
    overflow: "hidden",
    color: "inherit",
    background: "#0c120f",
    border: "1px solid #254233",
    borderRadius: "18px",
    textDecoration: "none",
  },
  mediaFrame: {
    width: "100%",
    aspectRatio: "1 / 1",
    overflow: "hidden",
    background: "#070b09",
    borderBottom: "1px solid #254233",
  },
  image: {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    background: "#070b09",
  },
  placeholder: {
    display: "grid",
    width: "100%",
    height: "100%",
    placeItems: "center",
    color: "#84958b",
    background: "#070b09",
  },
  content: {
    padding: "20px",
  },
  badge: {
    display: "inline-block",
    color: "#5cff9d",
    background: "#10261a",
    border: "1px solid #285f40",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
    padding: "6px 10px",
    marginBottom: "14px",
  },
  title: {
    fontSize: "19px",
    lineHeight: 1.4,
    margin: "0 0 18px",
  },
  facts: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    color: "#a9b8af",
    fontSize: "13px",
  },
}

export default async function NFTGrid() {
  const [results, collectionOwner] = await Promise.all([
    Promise.all(NFT_POST_HASHES.map(loadNFT)),
    loadCollectionOwner(),
  ])

  const automaticNFTResult = collectionOwner
    ? await loadAutomaticNFTCount(collectionOwner.PublicKeyBase58Check!)
    : null

  const nfts = results.filter(
    (result) => result !== null
  )

  const discoveredResults = automaticNFTResult
    ? await Promise.all(
        automaticNFTResult.discoveredNFTPostHashes.map(loadNFT)
      )
    : []

  const discoveredNFTs = discoveredResults.filter(
    (
      result
    ): result is NonNullable<Awaited<ReturnType<typeof loadNFT>>> =>
      result !== null &&
      !nfts.some((nft) => nft.postHash === result.postHash)
  )

  const collectionNFTs = [...nfts, ...discoveredNFTs]

  const renderNFTCard = (
    {
      postHash,
      post,
      forSaleCount,
      lowestBuyNowPrice,
      lowestMinBidAmount,
    }: NonNullable<Awaited<ReturnType<typeof loadNFT>>>,
  ) => {
    const creator = post.ProfileEntryResponse?.Username
      ? `@${post.ProfileEntryResponse.Username}`
      : "DeSo creator"

    return (
      <a
        key={postHash}
        href={`/nft/${postHash}`}
        style={styles.card}
      >
        <div style={styles.mediaFrame}>
          <NFTMedia
            url={post.ImageURLs?.[0]}
            alt={cardTitle(post.Body)}
            imageStyle={styles.image}
            placeholderStyle={styles.placeholder}
          />
        </div>

        <div style={styles.content}>
          <span style={styles.badge}>DeSo verified</span>

          <h2 style={styles.title}>{cardTitle(post.Body)}</h2>

          <div style={styles.facts}>
            <span>{creator}</span>
            <span>
              {post.NumNFTCopies ?? 0}{" "}
              {post.NumNFTCopies === 1 ? "copy" : "copies"}
              {" · "}
              {forSaleCount} for sale
              {" · "}
              {priceStatus(
                forSaleCount,
                lowestBuyNowPrice,
                lowestMinBidAmount
              )}
            </span>
          </div>
        </div>
      </a>
    )
  }

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <p style={styles.brand}>Lumen</p>
        <h1 style={styles.heading}>NFT collection</h1>

        <p style={styles.introduction}>
          Read-only NFT information loaded directly from the
          DeSo blockchain.
        </p>

        <p style={styles.owner}>
          {collectionOwner
            ? `Collection owner: @${collectionOwner.Username}`
            : "Collection owner unavailable"}
          <br />
          {automaticNFTResult === null
            ? "Automatic NFT check unavailable"
            : `Automatic NFTs found: ${automaticNFTResult.nftCount} of ${automaticNFTResult.checkedPosts} checked posts`}
          <br />
          {`Unique NFTs displayed: ${collectionNFTs.length}`}
          <br />
          {`Automatically added to collection: ${discoveredNFTs.length}`}
        </p>

        <div style={styles.grid}>
          {collectionNFTs.map(renderNFTCard)}
        </div>
      </div>
    </section>
  )
}
