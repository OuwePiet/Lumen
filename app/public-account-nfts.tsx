"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const DESO_NODE = "https://node.deso.org"
const PAGE_SIZE = 25
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".m4v"]
const AUDIO_EXTENSIONS = [".mp3", ".wav", ".m4a", ".aac", ".flac", ".oga"]

type DeSoPost = {
  PostHashHex?: string
  Body?: string
  ImageURLs?: string[]
  VideoURLs?: string[]
  NumNFTCopies?: number
  ProfileEntryResponse?: { Username?: string }
}

type NFTEntry = {
  IsForSale?: boolean
  BuyNowPriceNanos?: number
  MinBidAmountNanos?: number
}

type NFTCollection = {
  PostEntryResponse?: DeSoPost
  NFTEntryResponses?: NFTEntry[]
}

type MediaFilter = "all" | "image" | "video" | "audio" | "unavailable"
type SaleFilter = "all" | "for-sale" | "not-for-sale"

type SortMode = "collection" | "title" | "most-owned" | "fewest-owned"

function mediaType(post?: DeSoPost): Exclude<MediaFilter, "all"> {
  const videoUrl = post?.VideoURLs?.[0]
  const mediaUrl = videoUrl ?? post?.ImageURLs?.[0]

  if (!mediaUrl) return "unavailable"

  const path = mediaUrl.split(/[?#]/, 1)[0].toLowerCase()

  if (AUDIO_EXTENSIONS.some((extension) => path.endsWith(extension))) {
    return "audio"
  }

  if (
    videoUrl ||
    VIDEO_EXTENSIONS.some((extension) => path.endsWith(extension))
  ) {
    return "video"
  }

  return "image"
}

function formatDeSo(nanos: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 9,
  }).format(nanos / 1_000_000_000)
}

function ownedSaleStatus(entries: NFTEntry[]) {
  const forSale = entries.filter((entry) => entry.IsForSale)
  if (forSale.length === 0) return "Not for sale"

  const buyNowPrices = forSale
    .map((entry) => entry.BuyNowPriceNanos)
    .filter(
      (price): price is number =>
        typeof price === "number" && price > 0
    )
  if (buyNowPrices.length > 0) {
    return `${forSale.length} for sale · Buy now: ${formatDeSo(
      Math.min(...buyNowPrices)
    )} DESO`
  }

  const minBidAmounts = forSale
    .map((entry) => entry.MinBidAmountNanos)
    .filter(
      (amount): amount is number =>
        typeof amount === "number" && amount > 0
    )
  if (minBidAmounts.length > 0) {
    return `${forSale.length} for sale · Min bid: ${formatDeSo(
      Math.min(...minBidAmounts)
    )} DESO`
  }

  return `${forSale.length} for sale`
}

function title(body?: string) {
  const cleaned = (body ?? "")
    .replace(/https?:\/\/nftz\.me\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim()

  if (!cleaned) return "DeSo NFT"
  return cleaned.length > 72 ? `${cleaned.slice(0, 69)}...` : cleaned
}

const styles = {
  action: {
    background: "#5cff9d",
    border: "1px solid #5cff9d",
    borderRadius: "999px",
    color: "#050807",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 800,
    marginTop: "12px",
    padding: "9px 14px",
  },
  controls: {
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "10px",
    marginTop: "14px",
  },
  search: {
    background: "#050807",
    border: "1px solid #285f40",
    borderRadius: "10px",
    color: "#f4f7f5",
    fontSize: "13px",
    maxWidth: "420px",
    padding: "9px 11px",
    width: "100%",
  },
  controlLabel: {
    color: "#a9b8af",
    fontSize: "12px",
    fontWeight: 700,
  },
  filter: {
    background: "transparent",
    border: "1px solid #285f40",
    borderRadius: "999px",
    color: "#b9c8bf",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
    padding: "8px 12px",
  },
  filterActive: {
    background: "#5cff9d",
    borderColor: "#5cff9d",
    color: "#050807",
  },
  select: {
    background: "#050807",
    border: "1px solid #285f40",
    borderRadius: "10px",
    color: "#f4f7f5",
    fontSize: "13px",
    padding: "9px 11px",
  },
  status: {
    color: "#a9b8af",
    fontSize: "13px",
    margin: "12px 0 0",
  },
  error: {
    color: "#f1d89a",
    background: "#211a0c",
    border: "1px solid #6e5721",
    borderRadius: "12px",
    marginTop: "12px",
    padding: "12px",
  },
  grid: {
    display: "grid",
    gap: "10px",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    marginTop: "12px",
  },
  card: {
    background: "#07100b",
    border: "1px solid #285f40",
    borderRadius: "12px",
    color: "#f4f7f5",
    overflow: "hidden",
    textDecoration: "none",
  },
  media: {
    aspectRatio: "1 / 1",
    background: "#050807",
    display: "grid",
    overflow: "hidden",
    placeItems: "center",
  },
  image: {
    height: "100%",
    objectFit: "cover" as const,
    width: "100%",
  },
  placeholder: { color: "#84958b", fontSize: "12px" },
  content: { padding: "9px" },
  title: {
    display: "-webkit-box",
    fontSize: "13px",
    lineHeight: 1.35,
    margin: "0 0 6px",
    minHeight: "35px",
    overflow: "hidden",
    WebkitBoxOrient: "vertical" as const,
    WebkitLineClamp: 2,
  },
  fact: { color: "#a9b8af", fontSize: "11px", margin: 0 },
  saleFact: {
    color: "#b9ffd4",
    fontSize: "11px",
    margin: "5px 0 0",
  },
  more: {
    background: "transparent",
    border: "1px solid #285f40",
    borderRadius: "999px",
    color: "#b9ffd4",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 800,
    marginTop: "14px",
    padding: "8px 12px",
  },
}

export default function PublicAccountNFTs({
  publicKey,
  username,
  autoLoad = false,
}: {
  publicKey: string
  username: string
  autoLoad?: boolean
}) {
  const [nfts, setNFTs] = useState<NFTCollection[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const initialParams =
    typeof window === "undefined"
      ? new URLSearchParams()
      : new URLSearchParams(window.location.search)
  const [error, setError] = useState("")
  const [query, setQuery] = useState(initialParams.get("query") ?? "")
  const [sortMode, setSortMode] = useState<SortMode>(() => {
    const value = initialParams.get("sort")
    return value === "title" ||
      value === "most-owned" ||
      value === "fewest-owned"
      ? value
      : "collection"
  })
  const [saleFilter, setSaleFilter] = useState<SaleFilter>(() => {
    const value = initialParams.get("sale")
    return value === "for-sale" || value === "not-for-sale" ? value : "all"
  })
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>(() => {
    const value = initialParams.get("media")
    return value === "image" ||
      value === "video" ||
      value === "audio" ||
      value === "unavailable"
      ? value
      : "all"
  })
  const autoLoadStarted = useRef(false)

  const loadNFTs = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const collectionsByPostHash = new Map<string, NFTCollection>()
      const seenPageKeys = new Set<string>()
      let lastKeyHex = ""

      while (true) {
        const response = await fetch(`${DESO_NODE}/api/v0/get-nfts-for-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            UserPublicKeyBase58Check: publicKey,
            ReaderPublicKeyBase58Check: "",
            LastKeyHex: lastKeyHex,
            Limit: 100,
          }),
        })

        if (!response.ok) {
          setError("The complete public NFT collection could not be retrieved from DeSo right now.")
          return
        }

        const data = await response.json()
        const pageCollections: NFTCollection[] = Object.values(
          data.NFTsMap ?? {}
        )

        for (const collection of pageCollections) {
          const postHash = collection.PostEntryResponse?.PostHashHex
          if (!postHash) continue

          const existing = collectionsByPostHash.get(postHash)
          if (existing) {
            existing.NFTEntryResponses = [
              ...(existing.NFTEntryResponses ?? []),
              ...(collection.NFTEntryResponses ?? []),
            ]
          } else {
            collectionsByPostHash.set(postHash, collection)
          }
        }

        const nextKey =
          typeof data.LastKeyHex === "string" ? data.LastKeyHex : ""
        if (!nextKey || seenPageKeys.has(nextKey)) break

        seenPageKeys.add(nextKey)
        lastKeyHex = nextKey
      }

      setVisibleCount(PAGE_SIZE)
      setNFTs(Array.from(collectionsByPostHash.values()))
    } catch {
      setError("The public NFTs could not be retrieved from DeSo right now.")
    } finally {
      setLoading(false)
    }
  }, [publicKey])

  useEffect(() => {
    if (autoLoad && !autoLoadStarted.current) {
      autoLoadStarted.current = true
      void loadNFTs()
    }
  }, [autoLoad, loadNFTs])

  if (nfts === null) {
    return (
      <>
        <button
          type="button"
          style={styles.action}
          disabled={loading}
          onClick={loadNFTs}
        >
          {loading ? "Loading public NFTs…" : "View public NFTs"}
        </button>
        {error ? <div style={styles.error}>{error}</div> : null}
      </>
    )
  }

  const totalOwnedCopies = nfts.reduce(
    (total, collection) =>
      total + (collection.NFTEntryResponses?.length ?? 0),
    0
  )
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const filteredNFTs = normalizedQuery
    ? nfts.filter((collection) => {
        const post = collection.PostEntryResponse
        const searchableText = [
          post?.Body,
          post?.ProfileEntryResponse?.Username,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase()

        return searchableText.includes(normalizedQuery)
      })
    : nfts
  const saleFilteredNFTs = filteredNFTs.filter((collection) => {
    if (saleFilter === "all") return true

    const hasOwnedCopyForSale = (collection.NFTEntryResponses ?? []).some(
      (entry) => entry.IsForSale
    )

    return saleFilter === "for-sale"
      ? hasOwnedCopyForSale
      : !hasOwnedCopyForSale
  })
  const mediaFilteredNFTs = saleFilteredNFTs.filter((collection) =>
    mediaFilter === "all"
      ? true
      : mediaType(collection.PostEntryResponse) === mediaFilter
  )
  const sortedNFTs = [...mediaFilteredNFTs].sort((left, right) => {
    if (sortMode === "collection") return 0

    const leftTitle = title(left.PostEntryResponse?.Body)
    const rightTitle = title(right.PostEntryResponse?.Body)

    if (sortMode === "title") {
      return leftTitle.localeCompare(rightTitle, undefined, {
        sensitivity: "base",
      })
    }

    const leftOwned = left.NFTEntryResponses?.length ?? 0
    const rightOwned = right.NFTEntryResponses?.length ?? 0
    const ownedDifference =
      sortMode === "most-owned"
        ? rightOwned - leftOwned
        : leftOwned - rightOwned

    return (
      ownedDifference ||
      leftTitle.localeCompare(rightTitle, undefined, { sensitivity: "base" })
    )
  })
  const visibleNFTs = sortedNFTs.slice(0, visibleCount)
  const remaining = sortedNFTs.length - visibleNFTs.length

  return (
    <section aria-label={`Public NFTs owned by @${username}`}>
      {nfts.length > 0 ? (
        <p style={styles.status}>
          @{username} owns {totalOwnedCopies} NFT{" "}
          {totalOwnedCopies === 1 ? "copy" : "copies"} across {nfts.length}{" "}
          different NFT{nfts.length === 1 ? "" : "s"}.
        </p>
      ) : null}

      {nfts.length > 0 ? (
        <div style={styles.controls}>
          <input
            type="search"
            aria-label="Search this account collection"
            placeholder="Search by NFT title or creator"
            value={query}
            style={styles.search}
            onChange={(event) => {
              setQuery(event.target.value)
              setVisibleCount(PAGE_SIZE)
            }}
          />
          <select
            aria-label="Sort this account collection"
            value={sortMode}
            style={styles.select}
            onChange={(event) => {
              setSortMode(event.target.value as SortMode)
              setVisibleCount(PAGE_SIZE)
            }}
          >
            <option value="collection">Collection order</option>
            <option value="title">Title A–Z</option>
            <option value="most-owned">Most copies owned</option>
            <option value="fewest-owned">Fewest copies owned</option>
          </select>
          <span style={styles.controlLabel}>Sale</span>
          {(
            [
              ["all", "All"],
              ["for-sale", "For sale"],
              ["not-for-sale", "Not for sale"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={saleFilter === value}
              style={{
                ...styles.filter,
                ...(saleFilter === value ? styles.filterActive : {}),
              }}
              onClick={() => {
                setSaleFilter(value)
                setVisibleCount(PAGE_SIZE)
              }}
            >
              {label}
            </button>
          ))}
          <span style={styles.controlLabel}>Media</span>
          {(
            [
              ["all", "All"],
              ["image", "Image"],
              ["video", "Video"],
              ["audio", "Audio"],
              ["unavailable", "Unavailable"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mediaFilter === value}
              style={{
                ...styles.filter,
                ...(mediaFilter === value ? styles.filterActive : {}),
              }}
              onClick={() => {
                setMediaFilter(value)
                setVisibleCount(PAGE_SIZE)
              }}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      <p style={styles.status}>
        {nfts.length === 0
          ? `No public NFTs found for @${username}.`
          : `${mediaFilteredNFTs.length} of ${nfts.length} public NFTs shown for @${username}.`}
      </p>

      {mediaFilteredNFTs.length > 0 ? (
        <div style={styles.grid}>
          {visibleNFTs.map((collection) => {
            const post = collection.PostEntryResponse!
            const postHash = post.PostHashHex!
            const mediaUrl = post.VideoURLs?.[0] ?? post.ImageURLs?.[0]
            const ownedEntries = collection.NFTEntryResponses ?? []
            const ownedCopies = ownedEntries.length
            const totalCopies = post.NumNFTCopies ?? ownedCopies

            const returnParams = new URLSearchParams({
              account: username,
              view: "nfts",
              query,
              sort: sortMode,
              sale: saleFilter,
              media: mediaFilter,
            })

            return (
              <a
                key={postHash}
                href={`/nft/${postHash}?${returnParams.toString()}`}
                style={styles.card}
              >
                <div style={styles.media}>
                  {mediaUrl ? (
                    <img
                      src={mediaUrl}
                      alt=""
                      width={320}
                      height={320}
                      style={styles.image}
                    />
                  ) : (
                    <span style={styles.placeholder}>Media unavailable</span>
                  )}
                </div>
                <div style={styles.content}>
                  <h3 style={styles.title}>{title(post.Body)}</h3>
                  <p style={styles.fact}>
                    @{username} owns {ownedCopies} of {totalCopies}{" "}
                    {totalCopies === 1 ? "copy" : "copies"}
                  </p>
                  <p style={styles.saleFact}>
                    {ownedSaleStatus(ownedEntries)}
                  </p>
                </div>
              </a>
            )
          })}
        </div>
      ) : null}

      {remaining > 0 ? (
        <button
          type="button"
          style={styles.more}
          onClick={() =>
            setVisibleCount((current) =>
              Math.min(current + PAGE_SIZE, mediaFilteredNFTs.length)
            )
          }
        >
          Show next {Math.min(PAGE_SIZE, remaining)}
        </button>
      ) : null}
    </section>
  )
}
