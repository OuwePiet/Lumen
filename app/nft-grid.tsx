const DESO_NODE = "https://node.deso.org"

const NFT_POST_HASHES = [
  "000929e4490e3f744a7c889738d3aef52397ac72af906e5cd473bde710b49111",
  "267cd00db324d831b35722da8e5cc8895b9b0da610d5e384b4578e49f8319e84",
]

type DeSoPost = {
  Body?: string
  ImageURLs?: string[]
  NumNFTCopies?: number
  ProfileEntryResponse?: {
    Username?: string
  }
}

type NFTEntry = {
  IsForSale?: boolean
  BuyNowPriceNanos?: number
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

  return { postHash, post, forSaleCount, lowestBuyNowPrice }
}

function nanosToDeSo(nanos?: number) {
  if (typeof nanos !== "number") return "No buy price"

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 9,
  }).format(nanos / 1_000_000_000)} DESO`
}

function mediaUrl(url?: string) {
  if (!url) return undefined

  const marker = "/ipfs/"
  const index = url.indexOf(marker)

  if (index === -1) return url

  return `https://ipfs.io/ipfs/${url.slice(index + marker.length)}`
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
  image: {
    display: "block",
    width: "100%",
    aspectRatio: "1 / 1",
    objectFit: "cover" as const,
    background: "#070b09",
    borderBottom: "1px solid #254233",
  },
  placeholder: {
    display: "grid",
    width: "100%",
    aspectRatio: "1 / 1",
    placeItems: "center",
    color: "#84958b",
    background: "#070b09",
    borderBottom: "1px solid #254233",
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
  const results = await Promise.all(
    NFT_POST_HASHES.map(loadNFT)
  )

  const nfts = results.filter(
    (result) => result !== null
  )

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <p style={styles.brand}>Lumen</p>
        <h1 style={styles.heading}>NFT collection</h1>

        <p style={styles.introduction}>
          Read-only NFT information loaded directly from the
          DeSo blockchain.
        </p>

        <div style={styles.grid}>
          {nfts.map(({
            postHash,
            post,
            forSaleCount,
            lowestBuyNowPrice,
          }) => {
            const image = mediaUrl(post.ImageURLs?.[0])

            const creator =
              post.ProfileEntryResponse?.Username
                ? `@${post.ProfileEntryResponse.Username}`
                : "DeSo creator"

            return (
              <a
                key={postHash}
                href={`/nft/${postHash}`}
                style={styles.card}
              >
                {image ? (
                  <img
                    src={image}
                    alt={cardTitle(post.Body)}
                    width="600"
                    height="600"
                    style={styles.image}
                  />
                ) : (
                  <div style={styles.placeholder}>
                    No image available
                  </div>
                )}

                <div style={styles.content}>
                  <span style={styles.badge}>
                    DeSo verified
                  </span>

                  <h2 style={styles.title}>
                    {cardTitle(post.Body)}
                  </h2>

                  <div style={styles.facts}>
                    <span>{creator}</span>
                    <span>
  {post.NumNFTCopies ?? 0}{" "}
  {post.NumNFTCopies === 1 ? "copy" : "copies"}
  {" · "}
  {forSaleCount} for sale
  {" · "}
  {nanosToDeSo(lowestBuyNowPrice)}
</span>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
