import BackToCollection from "./back-to-collection"
import CopyNFTLink from "./copy-nft-link"
import EditionOwners from "./edition-owners"
import NFTMedia from "./nft-media"
import NFTHistory from "./nft-history"

const DESO_NODE = "https://node.deso.org"

type DeSoPost = {
  Body?: string
  ImageURLs?: string[]
  VideoURLs?: string[]
  NumNFTCopies?: number
  PosterPublicKeyBase58Check?: string
  TimestampNanos?: number
  ProfileEntryResponse?: {
    Username?: string
  }
}

type DeSoProfile = {
  Username?: string
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

async function loadProfileUsername(publicKey?: string) {
  if (!publicKey) return undefined

  const response = await fetch(`${DESO_NODE}/api/v0/get-single-profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ PublicKeyBase58Check: publicKey }),
    cache: "no-store",
  })

  if (!response.ok) return undefined

  const data = await response.json()
  const profile: DeSoProfile =
    data.Profile ?? data.ProfileEntryResponse ?? {}

  return profile.Username
}

function shortKey(publicKey?: string) {
  if (!publicKey) return "Not available"
  return `${publicKey.slice(0, 10)}...${publicKey.slice(-8)}`
}

function accountCollectionHref(username: string, publicKey?: string) {
  const params = new URLSearchParams({ account: username })

  if (publicKey) {
    params.set("accountKey", publicKey)
    params.set("view", "nfts")
  }

  return `/?${params.toString()}#account-lookup-heading`
}

function formatDeSo(nanos: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 9,
  }).format(nanos / 1_000_000_000)
}

function saleStatus(
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

function hasLegacyNFTzLink(body?: string) {
  return Boolean(body && /https?:\/\/nftz\.me\/\S+/i.test(body))
}

function cleanDescription(body?: string) {
  if (!body) return "No on-chain description available."

  return body
    .replace(/https?:\/\/nftz\.me\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim()
}

function nftTitle(body?: string) {
  if (!body) return "DeSo NFT"

  const cleaned = cleanDescription(body)
  if (!cleaned) return "DeSo NFT"

  return cleaned.length > 72
    ? `${cleaned.slice(0, 69)}...`
    : cleaned
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
    maxWidth: "1040px",
    margin: "0 auto",
  },
  topActions: {
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "12px",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  backLink: {
    display: "inline-block",
    color: "#a9b8af",
    fontSize: "14px",
    textDecoration: "none",
  },
  shareButton: {
    background: "transparent",
    border: "1px solid #285f40",
    borderRadius: "999px",
    color: "#b9ffd4",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 700,
    padding: "8px 12px",
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
    fontSize: "clamp(22px, 2.5vw, 32px)",
    lineHeight: 1.05,
    margin: "0 0 22px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    alignItems: "start",
  },
  mediaFrame: {
    aspectRatio: "1 / 1",
    background: "#0c120f",
    justifySelf: "center",
    maxWidth: "480px",
    width: "100%",
    border: "1px solid #254233",
    borderRadius: "18px",
    overflow: "hidden",
  },
  image: {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "contain" as const,
    background: "#0c120f",
  },
  placeholder: {
    display: "grid",
    width: "100%",
    height: "100%",
    placeItems: "center",
    color: "#84958b",
    background: "#070b09",
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
  warning: {
    color: "#f1d89a",
    background: "#211a0c",
    border: "1px solid #6e5721",
    borderRadius: "12px",
    fontSize: "13px",
    lineHeight: 1.6,
    margin: "0 0 20px",
    padding: "14px",
  },
  warningTitle: {
    display: "block",
    color: "#ffe7a6",
    fontWeight: 800,
    marginBottom: "4px",
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
  accountLink: {
    color: "#ffffff",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
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

export default async function NFTView({
  postHash,
  backHref = "/",
}: {
  postHash: string
  backHref?: string
}) {
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

    const sortedEntries = [...entries].sort(
      (a, b) => (a.SerialNumber ?? 0) - (b.SerialNumber ?? 0)
    )
    const ownerKeys = Array.from(
      new Set(
        sortedEntries
          .map((entry) => entry.OwnerPublicKeyBase58Check)
          .filter((key): key is string => Boolean(key))
      )
    )
    const ownerNames = new Map(
      await Promise.all(
        ownerKeys.map(async (key) => [
          key,
          await loadProfileUsername(key),
        ] as const)
      )
    )
    const firstEntry = sortedEntries.find((entry) => entry.SerialNumber === 1)
    const currentOwnerUsername = firstEntry?.OwnerPublicKeyBase58Check
      ? ownerNames.get(firstEntry.OwnerPublicKeyBase58Check)
      : undefined
    const currentOwner = currentOwnerUsername
      ? `@${currentOwnerUsername}`
      : shortKey(firstEntry?.OwnerPublicKeyBase58Check)
    const uniqueOwnerCount = ownerKeys.length
    const editionOwners = sortedEntries.map((entry, index) => {
      const ownerKey = entry.OwnerPublicKeyBase58Check
      const ownerUsername = ownerKey ? ownerNames.get(ownerKey) : undefined

      return {
        serialNumber: entry.SerialNumber ?? index + 1,
        owner: ownerUsername ? `@${ownerUsername}` : shortKey(ownerKey),
        publicKey: ownerKey,
      }
    })
    const forSale = entries.filter((entry) => entry.IsForSale)
    const bidAmounts = forSale
      .map((entry) => entry.MinBidAmountNanos)
      .filter(
        (amount): amount is number =>
          typeof amount === "number" && amount > 0
      )

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

    const creator = post.ProfileEntryResponse?.Username
      ? `@${post.ProfileEntryResponse.Username}`
      : shortKey(post.PosterPublicKeyBase58Check)

    const description = cleanDescription(post.Body)
    const legacyNFTzLinkDetected = hasLegacyNFTzLink(post.Body)
    const title = nftTitle(post.Body)

    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div style={styles.topActions}>
            <BackToCollection href={backHref} style={styles.backLink} />
            <CopyNFTLink style={styles.shareButton} />
          </div>
          <p style={styles.brand}>VIA</p>
          <h1 style={styles.title}>{title}</h1>

          <div style={styles.grid}>
            <div style={styles.mediaFrame}>
              <NFTMedia
                imageUrl={post.ImageURLs?.[0]}
                videoUrl={post.VideoURLs?.[0]}
                alt="NFT stored on the DeSo blockchain"
                imageStyle={styles.image}
                placeholderStyle={styles.placeholder}
              />
            </div>

            <section style={styles.card}>
              <div style={styles.badge}>DeSo verified</div>
              {legacyNFTzLinkDetected ? (
                <div style={styles.warning} role="note">
                  <strong style={styles.warningTitle}>
                    Legacy external link detected
                  </strong>
                  This on-chain description contains an nftz.me link that may
                  no longer work. VIA does not open or depend on this link.
                  NFT data remains available directly from DeSo.
                </div>
              ) : null}
              <p style={styles.description}>{description}</p>

              <dl style={styles.facts}>
                {[
                  ["Creator", creator],
                  sortedEntries.length === 1
                    ? ["Current owner", currentOwner]
                    : [
                        "Edition owners",
                        `${uniqueOwnerCount} unique owner${uniqueOwnerCount === 1 ? "" : "s"} across ${sortedEntries.length} editions`,
                      ],
                  ["Copies", post.NumNFTCopies ?? entries.length],
                  ["For sale", forSale.length],
                  [
                    "Sale status",
                    saleStatus(
                      forSale.length,
                      lowestBuyNowPrice,
                      lowestBid
                    ),
                  ],
                ].map(([label, value]) => (
                  <div key={String(label)} style={styles.fact}>
                    <dt style={styles.label}>{label}</dt>
                    <dd style={styles.value}>
                      {typeof value === "string" && value.startsWith("@") ? (
                        <a
                          href={accountCollectionHref(
                            value.slice(1),
                            label === "Creator"
                              ? post.PosterPublicKeyBase58Check
                              : label === "Current owner"
                                ? firstEntry?.OwnerPublicKeyBase58Check
                                : undefined
                          )}
                          style={styles.accountLink}
                        >
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>

              {sortedEntries.length > 1 ? (
                <EditionOwners editions={editionOwners} />
              ) : null}

              <NFTHistory
                postTimestampNanos={post.TimestampNanos}
                editionCount={sortedEntries.length}
                uniqueOwnerCount={uniqueOwnerCount}
                forSaleCount={forSale.length}
                saleStatus={saleStatus(
                  forSale.length,
                  lowestBuyNowPrice,
                  lowestBid
                )}
              />

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
          <div style={styles.topActions}>
            <BackToCollection href={backHref} style={styles.backLink} />
            <CopyNFTLink style={styles.shareButton} />
          </div>
          <p style={styles.brand}>VIA</p>
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
