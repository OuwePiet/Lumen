import { fetchDeSo } from "../../app/deso-api"
import type { ViaPublicPost } from "./deso-post-read"

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
}

type HotFeedResponse = { HotFeedPage?: unknown }

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

/**
 * Reads a bounded public DeSo hot-feed page for VIA Discovery.
 * DeSo documents the hotness algorithm as experimental, so VIA exposes this
 * only as a discovery source, never as a trust, quality or endorsement signal.
 * No wallet authority or write action is requested.
 */
export async function readDiscoveryPosts(limit = 20): Promise<ViaPublicPost[]> {
  const responseLimit = Math.max(1, Math.min(30, Math.trunc(limit) || 20))
  const response = await fetchDeSo("get-hot-feed", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      ReaderPublicKeyBase58Check: "",
      SeenPosts: [],
      ResponseLimit: responseLimit,
      Tag: "",
      SortByNew: false,
    }),
  })

  if (!response.ok) return []

  const data = (await response.json()) as HotFeedResponse
  const rawPosts = Array.isArray(data.HotFeedPage) ? (data.HotFeedPage as DeSoPost[]) : []

  return rawPosts
    .filter((post) => Boolean(post) && typeof post === "object" && post.IsHidden !== true)
    .slice(0, responseLimit)
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
    }))
    .filter((post) => Boolean(post.postHash))
}
