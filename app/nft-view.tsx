const DESO_NODE = "https://node.deso.org"

type DeSoPost = {
  Body?: string
  ImageURLs?: string[]
  NumNFTCopies?: number
  PosterPublicKeyBase58Check?: string
  ProfileEntryResponse?: {
    Username?: string
  }
}

type NFTEntry = {
  IsForSale?: boolean
  MinBidAmountNanos?: number
  OwnerPublicKeyBase58Check?: string
  BuyNowPriceNanos?: number
  SerialNumber?: number
}

async function requestDeSo(endpoint: string, postHash: string) {
  const response = await fetch(`${DESO_NODE}/api/v0/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      PostHashHex: postHash,
      ReaderPublicKeyBase58Check: "",
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`DeSo API returned ${response.status}`)
  }

  return response.json()
}

function shortKey(publicKey?: string) {
  if (!publicKey) return "Not available"
  return `${publicKey.slice(0, 10)}...${publicKey.slice(-8)}`
}

function nanosToDeSo(nanos?: number) {
  if (typeof nanos !== "number") return "Not available"

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 9,
  }).format(nanos / 1_000_000_000)} DESO`
}

function independentMediaUrl(url?: string) {
  if (!url) return undefined

  const ipfsMarker = "/ipfs/"
  const ipfsIndex = url.indexOf(ipfsMarker)

  if (ipfsIndex === -1) return url

  const ipfsPath = url.slice(ipfsIndex + ipfsMarker.length)
  return `https://ipfs.io/ipfs/${ipfsPath}`
}

function cleanDescription(body?: string) {
  if (!body) return "No on-chain description available."

  return body
    .replace(/https?:\/\/nftz\.me\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim()
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#050807",
    color: "#f4f7f5",
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: "32px 20px 64px",
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
    marginBottom: "10px",
    textTransform: "uppercase" as const,
  },
  title: {
    fontSize: "clamp(32px, 5vw, 58px)",
    lineHeight: 1.05,
    margin: "0 0 28px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "32px",
    alignItems: "start",
  },
  image: {
    display: "block",
    width: "100%",
    height: "auto",
    border: "1px solid #254233",
    borderRadius: "18px",
    background: "#0c120f",
  },
  card: {
    background: "#0c120f",
    border: "1px solid #254233",
    borderRadius: "18px",
    padding: "24px",
  },
  badge: {
    display: "inline-block",
    color: "#5cff9d",
    background: "#10261a",
    border: "1px solid #285f40",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    padding: "7px 11px",
    marginBottom: "18px",
  },
  description: {
    color: "#c4cec8",
    fontSize: "16px",
    lineHeight: 1.65,
    margin: "0 0 24px",
  },
  facts: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    margin: 0,
  },
  fact: {
    background: "#070b09",
    borderRadius: "12px",
    padding: "14px",
  },
  label: {
    color: "#84958b",
    fontSize: "12px",
    letterSpacing: "0.08em",
    margin: "0 0 6px",
    textTransform: "uppercase" as const,
  },
  value: {
    color: "#ffffff",
    fontSize: "17px",
    fontWeight: 700,
    margin: 0,
    overflowWrap: "anywhere" as const,
  },
  hash: {
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "1px solid #254233",
  },
  code: {
    display: "block",
    color: "#a9b8af",
    fontSize: "12px",
    lineHeight: 1.6,
    overflowWrap: "anywhere" as const,
  },
  source: {
    color: "#84958b",
    fontSize: "13px",
    lineHeight: 1.5,
    margin: "18px 0 0",
  },
}

export default async function NFTView({ postHash }: { postHash: string }) {
  try {
    const [postResponse, nftResponse] = await Promise.all([
      requestDeSo("get-single-post", postHash),
      requestDeSo("get-nft-entries-for-nft-post", postHash),
    ])

    const post: DeSoPost =
      postResponse.PostFound ?? postResponse.PostFoundResponse ?? {}

    const entries: NFTEntry[] =
      nftResponse.NFTEntryResponses ??
      nftResponse.NFTEntries ??
      nftResponse.NFTEntryResponse ??
      []

    const firstEntry = entries.find((entry) => entry.SerialNumber === 1)
    const forSale = entries.filter((entry) => entry.IsForSale)
    const bidAmounts = forSale
      .map((entry) => entry.MinBidAmountNanos)
      .filter((amount): amount is number => typeof amount === "number")

    const lowestBid =
      bidAmounts.length > 0 ? Math.min(...bidAmounts) : undefined

    const buyNowAmounts = forSale
  .map((entry) => entry.BuyNowPriceNanos)
  .filter(
    (amount): amount is number =>
      typeof amount === "number" && amount > 0
  )

const lowestBuyNowPrice =
  buyNowAmounts.length > 0 ? Math.min(...buyNowAmounts) : undefined

    const mediaUrl = independentMediaUrl(post.ImageURLs?.[0])
    const creator = post.ProfileEntryResponse?.Username
      ? `@${post.ProfileEntryResponse.Username}`
      : shortKey(post.PosterPublicKeyBase58Check)

    const description = cleanDescription(post.Body)

    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <p style={styles.brand}>Lumen</p>
          <h1 style={styles.title}>DeSo NFT</h1>

          <div style={styles.grid}>
            <div>
              {mediaUrl ? (
                <img
                  src={mediaUrl}
                  alt="NFT stored on the DeSo blockchain"
                  width="600"
                  style={styles.image}
                />
              ) : (
                <div style={styles.card}>No NFT image is available.</div>
              )}
            </div>

            <section style={styles.card}>
              <div style={styles.badge}>DeSo verified</div>
              <p style={styles.description}>{description}</p>

              <dl style={styles.facts}>
                {[
                  ["Creator", creator],
                  [
                    "Edition 1 owner",
                    shortKey(firstEntry?.OwnerPublicKeyBase58Check),
                  ],
                  ["Copies", post.NumNFTCopies ?? entries.length],
                  ["For sale", forSale.length],
                  ["Minimum bid", nanosToDeSo(lowestBid)],
        ["Buy price", nanosToDeSo(lowestBuyNowPrice)],
                ].map(([label, value]) => (
                  <div key={String(label)} style={styles.fact}>
                    <dt style={styles.label}>{label}</dt>
                    <dd style={styles.value}>{value}</dd>
                  </div>
                ))}
              </dl>

              <div style={styles.hash}>
                <p style={styles.label}>Blockchain PostHash</p>
                <code style={styles.code}>{postHash}</code>
              </div>

              <p style={styles.source}>
                NFT data is read directly from DeSo. IPFS media is loaded
                through an independent public gateway.
              </p>
            </section>
          </div>
        </div>
      </main>
    )
  } catch {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <p style={styles.brand}>Lumen</p>
          <h1 style={styles.title}>DeSo NFT</h1>

          <section style={styles.card}>
            <p>The NFT data could not be retrieved from DeSo right now.</p>
            <p>Please try again later.</p>
          </section>
        </div>
      </main>
    )
  }
}
