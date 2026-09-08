"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  getNFTsForUser,
  type DeSoNFTCollection,
  type DeSoNFTEntry,
  type DeSoNFTPost,
} from "./deso-nfts"
import NFTMedia from "./nft-media"

const PAGE_SIZE = 25
const CACHE_VERSION = 1
const QUERY_LIMIT = 120
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".m4v"]
const AUDIO_EXTENSIONS = [".mp3", ".wav", ".m4a", ".aac", ".flac", ".oga"]

type MediaFilter = "all" | "image" | "video" | "audio" | "unavailable"
type SaleFilter = "all" | "for-sale" | "not-for-sale"
type SortMode =
  | "collection"
  | "title"
  | "most-owned"
  | "fewest-owned"
  | "lowest-price"
  | "highest-price"

type NFTCacheEnvelope = {
  version: number
  publicKey: string
  savedAt: number
  collections: DeSoNFTCollection[]
}

function isFiniteNonNegativeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
}

function isStringArray(value: unknown) {
  return (
    value === undefined ||
    (Array.isArray(value) && value.every((item) => typeof item === "string"))
  )
}

function isPost(value: unknown): value is DeSoNFTPost {
  if (!value || typeof value !== "object") return false
  const post = value as DeSoNFTPost

  if (
    typeof post.PostHashHex !== "string" ||
    !/^[0-9a-fA-F]{64}$/.test(post.PostHashHex)
  ) {
    return false
  }

  if (post.Body !== undefined && typeof post.Body !== "string") return false
  if (!isStringArray(post.ImageURLs) || !isStringArray(post.VideoURLs)) return false
  if (
    post.NumNFTCopies !== undefined &&
    !isFiniteNonNegativeNumber(post.NumNFTCopies)
  ) {
    return false
  }

  return true
}

function isEntry(value: unknown): value is DeSoNFTEntry {
  if (!value || typeof value !== "object") return false
  const entry = value as DeSoNFTEntry

  if (entry.IsForSale !== undefined && typeof entry.IsForSale !== "boolean") {
    return false
  }
  if (
    entry.BuyNowPriceNanos !== undefined &&
    !isFiniteNonNegativeNumber(entry.BuyNowPriceNanos)
  ) {
    return false
  }
  if (
    entry.MinBidAmountNanos !== undefined &&
    !isFiniteNonNegativeNumber(entry.MinBidAmountNanos)
  ) {
    return false
  }

  return true
}

function isCollection(value: unknown): value is DeSoNFTCollection {
  if (!value || typeof value !== "object") return false
  const collection = value as DeSoNFTCollection

  if (!isPost(collection.PostEntryResponse)) return false
  if (
    collection.NFTEntryResponses !== undefined &&
    (!Array.isArray(collection.NFTEntryResponses) ||
      !collection.NFTEntryResponses.every(isEntry))
  ) {
    return false
  }

  return true
}

function readCache(value: string | null, publicKey: string) {
  if (!value) return null

  try {
    const parsed: unknown = JSON.parse(value)
    if (!parsed || typeof parsed !== "object") return null

    const envelope = parsed as NFTCacheEnvelope
    if (
      envelope.version !== CACHE_VERSION ||
      envelope.publicKey !== publicKey ||
      !Number.isFinite(envelope.savedAt) ||
      !Array.isArray(envelope.collections) ||
      !envelope.collections.every(isCollection)
    ) {
      return null
    }

    return envelope.collections
  } catch {
    return null
  }
}

function mediaType(post?: DeSoNFTPost): Exclude<MediaFilter, "all"> {
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

function lowestSalePrice(entries: DeSoNFTEntry[]) {
  const forSale = entries.filter((entry) => entry.IsForSale)
  const buyNow = forSale
    .map((entry) => entry.BuyNowPriceNanos)
    .filter((value): value is number => typeof value === "number" && value > 0)
  if (buyNow.length > 0) return Math.min(...buyNow)

  const minBid = forSale
    .map((entry) => entry.MinBidAmountNanos)
    .filter((value): value is number => typeof value === "number" && value > 0)
  return minBid.length > 0 ? Math.min(...minBid) : undefined
}

function ownedSaleStatus(entries: DeSoNFTEntry[]) {
  const forSale = entries.filter((entry) => entry.IsForSale)
  if (forSale.length === 0) return "Not for sale"

  const price = lowestSalePrice(entries)
  return price === undefined
    ? `${forSale.length} for sale`
    : `${forSale.length} for sale · From ${formatDeSo(price)} DESO`
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
    fontSize: "14px",
    fontWeight: 800,
    marginTop: "12px",
    minHeight: "44px",
    padding: "10px 16px",
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
    flex: "1 1 260px",
    fontSize: "16px",
    minHeight: "44px",
    padding: "10px 12px",
    width: "100%",
  },
  select: {
    background: "#050807",
    border: "1px solid #285f40",
    borderRadius: "10px",
    color: "#f4f7f5",
    fontSize: "14px",
    minHeight: "44px",
    padding: "9px 11px",
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
    fontSize: "13px",
    fontWeight: 700,
    minHeight: "44px",
    padding: "9px 13px",
  },
  filterActive: {
    background: "#5cff9d",
    borderColor: "#5cff9d",
    color: "#050807",
  },
  status: {
    color: "#a9b8af",
    fontSize: "13px",
    lineHeight: 1.5,
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
    gap: "12px",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(160px, 100%), 1fr))",
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
  placeholder: {
    color: "#84958b",
    display: "grid",
    fontSize: "12px",
    height: "100%",
    placeItems: "center",
    width: "100%",
  },
  content: { padding: "10px" },
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
  saleFact: { color: "#b9ffd4", fontSize: "11px", margin: "5px 0 0" },
  more: {
    background: "transparent",
    border: "1px solid #285f40",
    borderRadius: "999px",
    color: "#b9ffd4",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 800,
    marginTop: "14px",
    minHeight: "44px",
    padding: "9px 14px",
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
  const cacheKey = `via:account-nfts:v${CACHE_VERSION}:${publicKey}`
  const [nfts, setNFTs] = useState<DeSoNFTCollection[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [sortMode, setSortMode] = useState<SortMode>("collection")
  const [saleFilter, setSaleFilter] = useState<SaleFilter>("all")
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all")
  const [restored, setRestored] = useState(false)
  const autoLoadStarted = useRef(false)

  useEffect(() => {
    if (!autoLoad || restored) return

    const params = new URLSearchParams(window.location.search)
    setQuery((params.get("query") ?? "").slice(0, QUERY_LIMIT))

    const requestedSort = params.get("sort")
    if (
      requestedSort === "title" ||
      requestedSort === "most-owned" ||
      requestedSort === "fewest-owned" ||
      requestedSort === "lowest-price" ||
      requestedSort === "highest-price"
    ) {
      setSortMode(requestedSort)
    }

    const requestedSale = params.get("sale")
    if (requestedSale === "for-sale" || requestedSale === "not-for-sale") {
      setSaleFilter(requestedSale)
    }

    const requestedMedia = params.get("media")
    if (
      requestedMedia === "image" ||
      requestedMedia === "video" ||
      requestedMedia === "audio" ||
      requestedMedia === "unavailable"
    ) {
      setMediaFilter(requestedMedia)
    }

    try {
      const cached = readCache(window.sessionStorage.getItem(cacheKey), publicKey)
      if (cached) {
        setNFTs(cached)
      } else {
        window.sessionStorage.removeItem(cacheKey)
      }
    } catch {
      // Cache is optional. A live DeSo request remains authoritative.
    } finally {
      setRestored(true)
    }
  }, [autoLoad, cacheKey, publicKey, restored])

  const loadNFTs = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const collections = await getNFTsForUser(publicKey)
      setVisibleCount(PAGE_SIZE)
      setNFTs(collections)

      const envelope: NFTCacheEnvelope = {
        version: CACHE_VERSION,
        publicKey,
        savedAt: Date.now(),
        collections,
      }
      try {
        window.sessionStorage.setItem(cacheKey, JSON.stringify(envelope))
      } catch {
        // Session cache is an optimisation only.
      }
    } catch {
      setError("The public NFTs could not be retrieved from DeSo right now.")
    } finally {
      setLoading(false)
    }
  }, [cacheKey, publicKey])

  useEffect(() => {
    if (autoLoad && restored && !autoLoadStarted.current) {
      autoLoadStarted.current = true
      void loadNFTs()
    }
  }, [autoLoad, loadNFTs, restored])

  const collectionParams = new URLSearchParams({
    account: username,
    accountKey: publicKey,
    view: "nfts",
  })
  const collectionHref = `/?${collectionParams.toString()}#account-lookup-heading`

  if (nfts === null) {
    if (autoLoad) {
      return (
        <div aria-live="polite" aria-busy={loading}>
          <button
            type="button"
            style={styles.action}
            disabled={!error || loading}
            onClick={loadNFTs}
          >
            {error ? "Try loading public NFTs again" : "Loading public NFTs…"}
          </button>
          {error ? <div style={styles.error} role="alert">{error}</div> : null}
        </div>
      )
    }

    return (
      <a
        href={collectionHref}
        style={{ ...styles.action, display: "inline-block", textDecoration: "none" }}
      >
        View public NFTs
      </a>
    )
  }

  const totalOwnedCopies = nfts.reduce(
    (total, collection) => total + (collection.NFTEntryResponses?.length ?? 0),
    0
  )
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const filteredNFTs = normalizedQuery
    ? nfts.filter((collection) => {
        const post = collection.PostEntryResponse
        return [post?.Body, post?.ProfileEntryResponse?.Username]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase()
          .includes(normalizedQuery)
      })
    : nfts

  const saleFilteredNFTs = filteredNFTs.filter((collection) => {
    if (saleFilter === "all") return true
    const hasSale = (collection.NFTEntryResponses ?? []).some(
      (entry) => entry.IsForSale
    )
    return saleFilter === "for-sale" ? hasSale : !hasSale
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
    if (sortMode === "title") return leftTitle.localeCompare(rightTitle)

    if (sortMode === "lowest-price" || sortMode === "highest-price") {
      const leftPrice = lowestSalePrice(left.NFTEntryResponses ?? [])
      const rightPrice = lowestSalePrice(right.NFTEntryResponses ?? [])
      if (leftPrice === undefined && rightPrice === undefined) {
        return leftTitle.localeCompare(rightTitle)
      }
      if (leftPrice === undefined) return 1
      if (rightPrice === undefined) return -1
      return sortMode === "lowest-price"
        ? leftPrice - rightPrice
        : rightPrice - leftPrice
    }

    const leftOwned = left.NFTEntryResponses?.length ?? 0
    const rightOwned = right.NFTEntryResponses?.length ?? 0
    return sortMode === "most-owned"
      ? rightOwned - leftOwned
      : leftOwned - rightOwned
  })

  const visibleNFTs = sortedNFTs.slice(0, visibleCount)
  const remaining = sortedNFTs.length - visibleNFTs.length
  const controlsChanged =
    query !== "" ||
    sortMode !== "collection" ||
    saleFilter !== "all" ||
    mediaFilter !== "all"

  const resetControls = () => {
    setQuery("")
    setSortMode("collection")
    setSaleFilter("all")
    setMediaFilter("all")
    setVisibleCount(PAGE_SIZE)
  }

  const shareParams = new URLSearchParams({
    account: username,
    accountKey: publicKey,
    view: "nfts",
    query,
    sort: sortMode,
    sale: saleFilter,
    media: mediaFilter,
  })
  const sharePath = `/?${shareParams.toString()}#account-lookup-heading`

  const copyCollectionLink = async () => {
    const shareUrl = `${window.location.origin}${sharePath}`
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      const temporaryInput = document.createElement("textarea")
      temporaryInput.value = shareUrl
      temporaryInput.style.position = "fixed"
      temporaryInput.style.opacity = "0"
      document.body.appendChild(temporaryInput)
      temporaryInput.select()
      document.execCommand("copy")
      temporaryInput.remove()
    }
    setLinkCopied(true)
    window.setTimeout(() => setLinkCopied(false), 2000)
  }

  return (
    <section aria-label={`Public NFTs owned by @${username}`}>
      {nfts.length > 0 ? (
        <p style={styles.status}>
          @{username} owns {totalOwnedCopies} NFT {totalOwnedCopies === 1 ? "copy" : "copies"} across {nfts.length} different NFT{nfts.length === 1 ? "" : "s"}.
        </p>
      ) : null}

      {nfts.length > 0 ? (
        <div style={styles.controls}>
          <input
            type="search"
            aria-label="Search this account collection"
            placeholder="Search by NFT title or creator"
            maxLength={QUERY_LIMIT}
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
            <option value="lowest-price">Lowest price</option>
            <option value="highest-price">Highest price</option>
          </select>
          <span style={styles.controlLabel}>Sale</span>
          {([[
            "all",
            "All",
          ], ["for-sale", "For sale"], ["not-for-sale", "Not for sale"]] as const).map(
            ([value, label]) => (
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
            )
          )}
          <span style={styles.controlLabel}>Media</span>
          {([[
            "all",
            "All",
          ], ["image", "Image"], ["video", "Video"], ["audio", "Audio"], ["unavailable", "Unavailable"]] as const).map(
            ([value, label]) => (
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
            )
          )}
          <button
            type="button"
            disabled={!controlsChanged}
            style={{
              ...styles.filter,
              opacity: controlsChanged ? 1 : 0.55,
              cursor: controlsChanged ? "pointer" : "default",
            }}
            onClick={resetControls}
          >
            Reset filters
          </button>
          <button type="button" style={styles.filter} onClick={copyCollectionLink}>
            {linkCopied ? "Link copied" : "Copy collection link"}
          </button>
          <button
            type="button"
            style={styles.filter}
            disabled={loading}
            onClick={loadNFTs}
          >
            {loading ? "Refreshing from DeSo…" : "Refresh from DeSo"}
          </button>
        </div>
      ) : null}

      {error ? <div style={styles.error} role="alert">{error}</div> : null}

      <p style={styles.status} aria-live="polite">
        {nfts.length === 0
          ? `No public NFTs found for @${username}.`
          : `${mediaFilteredNFTs.length} of ${nfts.length} public NFTs match.`}
      </p>

      {mediaFilteredNFTs.length > 0 ? (
        <div style={styles.grid}>
          {visibleNFTs.map((collection) => {
            const post = collection.PostEntryResponse!
            const postHash = post.PostHashHex!
            const ownedEntries = collection.NFTEntryResponses ?? []
            const ownedCopies = ownedEntries.length
            const totalCopies = post.NumNFTCopies ?? ownedCopies

            const returnParams = new URLSearchParams({
              account: username,
              accountKey: publicKey,
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
                aria-label={`${title(post.Body)}. ${ownedSaleStatus(ownedEntries)}`}
              >
                <div style={styles.media}>
                  <NFTMedia
                    imageUrl={post.ImageURLs?.[0]}
                    videoUrl={post.VideoURLs?.[0]}
                    alt={title(post.Body)}
                    imageStyle={styles.image}
                    placeholderStyle={styles.placeholder}
                  />
                </div>
                <div style={styles.content}>
                  <h3 style={styles.title}>{title(post.Body)}</h3>
                  <p style={styles.fact}>
                    @{username} owns {ownedCopies} of {totalCopies} {totalCopies === 1 ? "copy" : "copies"}
                  </p>
                  <p style={styles.saleFact}>{ownedSaleStatus(ownedEntries)}</p>
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
