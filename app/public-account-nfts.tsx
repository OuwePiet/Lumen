"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import NFTMedia from "./nft-media"

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

type SortMode =
  | "collection"
  | "title"
  | "most-owned"
  | "fewest-owned"
  | "lowest-price"
  | "highest-price"

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

function lowestSalePrice(entries: NFTEntry[]) {
  const forSale = entries.filter((entry) => entry.IsForSale)
  const buyNowPrices = forSale
    .map((entry) => entry.BuyNowPriceNanos)
    .filter(
      (price): price is number =>
        typeof price === "number" && price > 0
    )

  if (buyNowPrices.length > 0) return Math.min(...buyNowPrices)

  const minBidAmounts = forSale
    .map((entry) => entry.MinBidAmountNanos)
    .filter(
      (amount): amount is number =>
        typeof amount === "number" && amount > 0
    )

  return minBidAmounts.length > 0 ? Math.min(...minBidAmounts) : undefined
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
  placeholder: {
    color: "#84958b",
    display: "grid",
    fontSize: "12px",
    height: "100%",
    placeItems: "center",
    width: "100%",
  },
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
  const cacheKey = `via:account-nfts:${publicKey}`
  const legacyCacheKey = `lumen:account-nfts:${publicKey}`
  const [nfts, setNFTs] = useState<NFTCollection[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [sortMode, setSortMode] = useState<SortMode>("collection")
  const [saleFilter, setSaleFilter] = useState<SaleFilter>("all")
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all")
  const [isInitialStateRestored, setIsInitialStateRestored] = useState(false)
  const autoLoadStarted = useRef(false)

  useEffect(() => {
    if (!autoLoad || isInitialStateRestored) return

    const params = new URLSearchParams(window.location.search)
    const requestedSort = params.get("sort")
    const requestedSale = params.get("sale")
    const requestedMedia = params.get("media")

    setQuery(params.get("query") ?? "")
    if (
      requestedSort === "title" ||
      requestedSort === "most-owned" ||
      requestedSort === "fewest-owned" ||
      requestedSort === "lowest-price" ||
      requestedSort === "highest-price"
    ) {
      setSortMode(requestedSort)
    }
    if (requestedSale === "for-sale" || requestedSale === "not-for-sale") {
      setSaleFilter(requestedSale)
    }
    if (
      requestedMedia === "image" ||
      requestedMedia === "video" ||
      requestedMedia === "audio" ||
      requestedMedia === "unavailable"
    ) {
      setMediaFilter(requestedMedia)
    }

    let restoredKey: string | null = null
    try {
      const currentValue = window.sessionStorage.getItem(cacheKey)
      const legacyValue = window.sessionStorage.getItem(legacyCacheKey)
      const cachedValue = currentValue ?? legacyValue
      restoredKey = currentValue
        ? cacheKey
        : legacyValue
          ? legacyCacheKey
          : null

      if (cachedValue) {
        const cachedNFTs: unknown = JSON.parse(cachedValue)
        if (Array.isArray(cachedNFTs)) {
          setNFTs(cachedNFTs as NFTCollection[])
          if (restoredKey === legacyCacheKey) {
            window.sessionStorage.setItem(cacheKey, cachedValue)
            window.sessionStorage.removeItem(legacyCacheKey)
          }
        }
      }
    } catch {
      if (restoredKey) window.sessionStorage.removeItem(restoredKey)
    } finally {
      setIsInitialStateRestored(true)
    }
  }, [autoLoad, cacheKey, isInitialStateRestored, legacyCacheKey])

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

      const completeCollection = Array.from(collectionsByPostHash.values())
      setVisibleCount(PAGE_SIZE)
      setNFTs(completeCollection)
      try {
        window.sessionStorage.setItem(
          cacheKey,
          JSON.stringify(completeCollection)
        )
      } catch {
        // A fresh DeSo load remains available when session storage is full.
      }
    } catch {
      setError("The public NFTs could not be retrieved from DeSo right now.")
    } finally {
      setLoading(false)
    }
  }, [cacheKey, publicKey])

  useEffect(() => {
    if (
      autoLoad &&
      isInitialStateRestored &&
      nfts === null &&
      !autoLoadStarted.current
    ) {
      autoLoadStarted.current = true
      void loadNFTs()
    }
  }, [autoLoad, isInitialStateRestored, loadNFTs, nfts])

  const collectionParams = new URLSearchParams({
    account: username,
    accountKey: publicKey,
    view: "nfts",
  })
  const collectionHref =
    `/?${collectionParams.toString()}#account-lookup-heading`

  if (nfts === null) {
    if (autoLoad) {
      return (
        <>
          <button
            type="button"
            style={styles.action}
            disabled={!error || loading}
            onClick={loadNFTs}
          >
            {error ? "Try loading public NFTs again" : "Loading public NFTs…"}
          </button>
          {error ? <div style={styles.error}>{error}</div> : null}
        </>
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

    if (sortMode === "lowest-price" || sortMode === "highest-price") {
      const leftPrice = lowestSalePrice(left.NFTEntryResponses ?? [])
      const rightPrice = lowestSalePrice(right.NFTEntryResponses ?? [])

      if (leftPrice === undefined && rightPrice === undefined) {
        return leftTitle.localeCompare(rightTitle, undefined, {
          sensitivity: "base",
        })
      }
      if (leftPrice === undefined) return 1
      if (rightPrice === undefined) return -1

      const priceDifference =
        sortMode === "lowest-price"
          ? leftPrice - rightPrice
          : rightPrice - leftPrice

      return (
        priceDifference ||
        leftTitle.localeCompare(rightTitle, undefined, {
          sensitivity: "base",
        })
      )
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
  const sharePath =
    `/?${shareParams.toString()}#account-lookup-heading`

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
            <option value="lowest-price">Lowest price</option>
            <option value="highest-price">Highest price</option>
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
            Reset collection filters
          </button>
          <button
            type="button"
            style={styles.filter}
            onClick={copyCollectionLink}
          >
            {linkCopied ? "Collection link copied" : "Copy collection link"}
          </button>
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
