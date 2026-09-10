import { fetchDeSo } from "../../app/deso-api"

export type ViaPublicPost = {
  postHash: string
  publicKey: string
  body: string
  imageUrls: string[]
  videoUrls: string[]
  timestampNanos: number
  likeCount: number
  diamondCount: number
  commentCount: number
  repostCount: number
  quoteRepostCount: number
  isNft: boolean
  postExtraData: Record<string, string>
}

type DeSoPost = {
  PostHashHex?: unknown
  PosterPublicKeyBase58Check?: unknown
  Body?: unknown
  ImageURLs?: unknown
  VideoURLs?: unknown
  TimestampNanos?: unknown
  LikeCount?: unknown
  DiamondCount?: unknown
  CommentCount?: unknown
  RepostCount?: unknown
  QuoteRepostCount?: unknown
  IsNFT?: unknown
  IsHidden?: unknown
  PostExtraData?: unknown
}

type DeSoPostsResponse = {
  Posts?: unknown
  PostsFound?: unknown
}

function text(value: unknown) {
  return typeof value === "string" ? value : ""
}

function count(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0
}

function safeHttpsUrls(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === "string" && /^https:\/\//i.test(item))
    .slice(0, 8)
}

function safePostExtraData(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([key, item]) => key.length > 0 && key.length <= 128 && typeof item === "string" && item.length <= 10_000)
    .slice(0, 64) as Array<[string, string]>
  return Object.fromEntries(entries)
}

/**
 * Reads public posts for one DeSo identity. The backend endpoint uses POST as
 * a query transport, but this function has read-only effect: it never builds,
 * signs or broadcasts a transaction and never requests wallet authority.
 * PostExtraData is preserved as bounded string metadata so later DeSo-native
 * features can inspect it without inventing or mutating a VIA-only format.
 */
export async function readPublicPosts(
  usernameOrPublicKey: string,
  limit = 20,
): Promise<ViaPublicPost[]> {
  const identity = usernameOrPublicKey.trim().replace(/^@/, "")
  if (!identity || identity.length > 128) return []

  const numToFetch = Math.max(1, Math.min(50, Math.trunc(limit) || 20))
  const isPublicKey = identity.startsWith("BC1")

  const response = await fetchDeSo("get-posts-for-public-key", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      PublicKeyBase58Check: isPublicKey ? identity : "",
      Username: isPublicKey ? "" : identity,
      ReaderPublicKeyBase58Check: "",
      NumToFetch: numToFetch,
      MediaRequired: false,
    }),
  })

  if (!response.ok) return []

  const data = (await response.json()) as DeSoPostsResponse
  const rawPosts = Array.isArray(data.Posts)
    ? data.Posts
    : Array.isArray(data.PostsFound)
      ? data.PostsFound
      : []

  return rawPosts
    .filter((value): value is DeSoPost => Boolean(value) && typeof value === "object")
    .filter((post) => post.IsHidden !== true)
    .slice(0, numToFetch)
    .map((post) => ({
      postHash: text(post.PostHashHex),
      publicKey: text(post.PosterPublicKeyBase58Check),
      body: text(post.Body),
      imageUrls: safeHttpsUrls(post.ImageURLs),
      videoUrls: safeHttpsUrls(post.VideoURLs),
      timestampNanos: count(post.TimestampNanos),
      likeCount: count(post.LikeCount),
      diamondCount: count(post.DiamondCount),
      commentCount: count(post.CommentCount),
      repostCount: count(post.RepostCount),
      quoteRepostCount: count(post.QuoteRepostCount),
      isNft: post.IsNFT === true,
      postExtraData: safePostExtraData(post.PostExtraData),
    }))
    .filter((post) => Boolean(post.postHash))
}
