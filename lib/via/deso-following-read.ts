import { fetchDeSo } from "../../app/deso-api"
import type { ViaPublicPost } from "./deso-post-read"
import { readPublicProfile } from "./deso-profile-read"

type DeSoPost = {
  PostHashHex?: unknown
  PosterPublicKeyBase58Check?: unknown
  ProfileEntryResponse?: { Username?: unknown; ProfilePic?: unknown; IsVerified?: unknown } | null
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
  PostsFound?: unknown
}

export type ViaFollowingPost = ViaPublicPost & {
  sourcePublicKey: string
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

function normalizeFollowingPost(post: DeSoPost): ViaFollowingPost {
  const publicKey = text(post.PosterPublicKeyBase58Check)
  return {
    postHash: text(post.PostHashHex),
    publicKey,
    username: text(post.ProfileEntryResponse?.Username),
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
    sourcePublicKey: publicKey,\n    profilePic: text(post.ProfileEntryResponse?.ProfilePic),\n    isVerified: post.ProfileEntryResponse?.IsVerified === true,
  }
}

/**
 * Read DeSo's native following feed for the active identity.
 * This is read-only: no follow relationship is changed and no wallet/signing
 * authority is requested.
 */
export async function readFollowingPosts(
  usernameOrPublicKey: string,
  limit = 30,
): Promise<ViaFollowingPost[]> {
  const profile = await readPublicProfile(usernameOrPublicKey)
  if (!profile?.publicKey) return []

  const numToFetch = Math.max(1, Math.min(50, Math.trunc(limit) || 30))
  const response = await fetchDeSo("get-posts-stateless", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      GetPostsForFollowFeed: true,
      ReaderPublicKeyBase58Check: profile.publicKey,
      NumToFetch: numToFetch,
      FetchSubcomments: false,
      MediaRequired: false,
    }),
  })

  if (!response.ok) return []

  const data = (await response.json()) as DeSoPostsResponse
  const rawPosts = Array.isArray(data.PostsFound) ? (data.PostsFound as DeSoPost[]) : []

  return rawPosts
    .filter((post) => post && typeof post === "object" && post.IsHidden !== true)
    .slice(0, numToFetch)
    .map(normalizeFollowingPost)
    .filter((post) => Boolean(post.postHash && post.publicKey))
}
