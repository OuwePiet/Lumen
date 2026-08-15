"use client"

import { useState } from "react"

const DESO_NODE = "https://node.deso.org"
const PAGE_SIZE = 25

type DeSoPost = {
  PostHashHex?: string
  Body?: string
  ImageURLs?: string[]
  VideoURLs?: string[]
  NumNFTCopies?: number
  ProfileEntryResponse?: { Username?: string }
}

type NFTCollection = {
  PostEntryResponse?: DeSoPost
  NFTEntryResponses?: unknown[]
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
  search: {
    background: "#050807",
    border: "1px solid #285f40",
    borderRadius: "10px",
    color: "#f4f7f5",
    fontSize: "13px",
    marginTop: "14px",
    maxWidth: "420px",
    padding: "9px 11px",
    width: "100%",
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
}: {
  publicKey: string
  username: string
}) {
  const [nfts, setNFTs] = useState<NFTCollection[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")

  const loadNFTs = async () => {
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
  }

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
  const visibleNFTs = filteredNFTs.slice(0, visibleCount)
  const remaining = filteredNFTs.length - visibleNFTs.length

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
      ) : null}

      <p style={styles.status}>
        {nfts.length === 0
          ? `No public NFTs found for @${username}.`
          : `${filteredNFTs.length} of ${nfts.length} public NFTs shown for @${username}.`}
      </p>

      {filteredNFTs.length > 0 ? (
        <div style={styles.grid}>
          {visibleNFTs.map((collection) => {
            const post = collection.PostEntryResponse!
            const postHash = post.PostHashHex!
            const mediaUrl = post.VideoURLs?.[0] ?? post.ImageURLs?.[0]
            const ownedCopies = collection.NFTEntryResponses?.length ?? 0
            const totalCopies = post.NumNFTCopies ?? ownedCopies

            return (
              <a key={postHash} href={`/nft/${postHash}`} style={styles.card}>
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
              Math.min(current + PAGE_SIZE, filteredNFTs.length)
            )
          }
        >
          Show next {Math.min(PAGE_SIZE, remaining)}
        </button>
      ) : null}
    </section>
  )
}
