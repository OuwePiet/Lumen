const POST_HASH =
  "000929e4490e3f744a7c889738d3aef52397ac72af906e5cd473bde710b49111"

const DESO_NODE = "https://node.deso.org"

export const dynamic = "force-dynamic"

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
  SerialNumber?: number
}

async function requestDeSo(endpoint: string) {
  const response = await fetch(`${DESO_NODE}/api/v0/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      PostHashHex: POST_HASH,
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

export default async function Home() {
  try {
    const [postResult, nftResult] = await Promise.all([
      requestDeSo("get-single-post"),
      requestDeSo("get-nft-entries-for-nft-post"),
    ])

    const post: DeSoPost =
      postResult.PostFound ?? nftResult.PostEntryResponse ?? {}
    const entries: NFTEntry[] = nftResult.NFTEntryResponses ?? []
    const forSale = entries.filter((entry) => entry.IsForSale)
    const lowestBid = forSale.reduce<number | undefined>((lowest, entry) => {
      if (typeof entry.MinBidAmountNanos !== "number") return lowest
      return lowest === undefined
        ? entry.MinBidAmountNanos
        : Math.min(lowest, entry.MinBidAmountNanos)
    }, undefined)
    const firstEntry =
      entries.find((entry) => entry.SerialNumber === 1) ?? entries[0]
    const mediaUrl = independentMediaUrl(post.ImageURLs?.[0])
    const creator = post.ProfileEntryResponse?.Username
      ? `@${post.ProfileEntryResponse.Username}`
      : shortKey(post.PosterPublicKeyBase58Check)

    return (
      <main>
        <h1>Lumen — DeSo NFT</h1>

        {mediaUrl && (
          <img
            src={mediaUrl}
            alt="NFT stored on the DeSo blockchain"
            width="600"
          />
        )}

        <p>{post.Body || "No on-chain description available."}</p>

        <dl>
          <dt>Creator</dt>
          <dd>{creator}</dd>

          <dt>Edition 1 owner</dt>
          <dd>{shortKey(firstEntry?.OwnerPublicKeyBase58Check)}</dd>

          <dt>Copies</dt>
          <dd>{post.NumNFTCopies ?? entries.length}</dd>

          <dt>For sale</dt>
          <dd>{forSale.length}</dd>

          <dt>Minimum bid</dt>
          <dd>{nanosToDeSo(lowestBid)}</dd>
        </dl>

        <p>
          <strong>Blockchain PostHash</strong>
          <br />
          <code>{POST_HASH}</code>
        </p>

        <p>
          NFT data is read directly from DeSo. IPFS media is loaded through an
          independent public gateway.
        </p>
      </main>
    )
  } catch {
    return (
      <main>
        <h1>Lumen — DeSo NFT</h1>
        <p>The NFT data could not be retrieved from DeSo right now.</p>
        <p>Please try again later.</p>
      </main>
    )
  }
}
