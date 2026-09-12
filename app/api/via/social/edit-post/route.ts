import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../../deso-api"

export const dynamic = "force-dynamic"

const MAX_POST_LENGTH = 5000
const MAX_MEDIA_URL_LENGTH = 2048
const MAX_IMAGE_URLS = 4
const MAX_VIDEO_URLS = 1
const DEFAULT_MIN_FEE_RATE_NANOS_PER_KB = 1000

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } })
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null
}

function validPublicKey(value: unknown): value is string {
  return typeof value === "string" && value.length >= 40 && value.length <= 128 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(value)
}

function validPostHash(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-fA-F]{64}$/.test(value)
}

function validHex(value: unknown): value is string {
  return typeof value === "string" && value.length >= 2 && value.length <= 500_000 && value.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(value)
}

function safeUrls(value: unknown, maxItems: number) {
  if (value == null) return [] as string[]
  if (!Array.isArray(value) || value.length > maxItems) return null
  const result: string[] = []
  for (const item of value) {
    if (typeof item !== "string" || item.length === 0 || item.length > MAX_MEDIA_URL_LENGTH) return null
    try {
      const url = new URL(item)
      if (url.protocol !== "https:" || url.username || url.password) return null
      result.push(url.toString())
    } catch {
      return null
    }
  }
  return result
}

function safeExtraData(value: unknown) {
  const source = record(value)
  if (!source) return {} as Record<string, string>
  const output: Record<string, string> = {}
  for (const [key, item] of Object.entries(source)) {
    if (typeof item === "string" && key.length <= 100 && item.length <= 4000) output[key] = item
  }
  return output
}

async function loadOwnedPost(postHashHex: string, publicKey: string) {
  const response = await fetchDeSo("get-single-post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      PostHashHex: postHashHex,
      FetchParents: false,
      CommentOffset: 0,
      CommentLimit: 0,
      ReaderPublicKeyBase58Check: publicKey,
      AddGlobalFeedBool: false,
    }),
  })
  if (!response.ok) return { error: "DESO_POST_LOOKUP_REJECTED" as const }
  const data = await response.json() as Record<string, unknown>
  const post = record(data.PostFound)
  if (!post) return { error: "POST_NOT_FOUND" as const }
  if (post.PosterPublicKeyBase58Check !== publicKey) return { error: "POST_NOT_OWNED_BY_ACTIVE_KEY" as const }
  if (post.RepostedPostEntryResponse) return { error: "EDIT_REPOST_NOT_SUPPORTED" as const }

  const imageUrls = safeUrls(post.ImageURLs, MAX_IMAGE_URLS)
  const videoUrls = safeUrls(post.VideoURLs, MAX_VIDEO_URLS)
  if (!imageUrls || !videoUrls) return { error: "UNSAFE_EXISTING_MEDIA" as const }

  return {
    post: {
      postHashHex: typeof post.PostHashHex === "string" ? post.PostHashHex : postHashHex,
      body: typeof post.Body === "string" ? post.Body : "",
      parentStakeID: typeof post.ParentStakeID === "string" ? post.ParentStakeID : "",
      imageUrls,
      videoUrls,
      postExtraData: safeExtraData(post.PostExtraData),
    },
  }
}

export async function POST(request: Request) {
  let input: unknown
  try { input = await request.json() } catch { return json({ ok: false, error: "INVALID_JSON" }, 400) }
  const body = record(input)
  if (!body) return json({ ok: false, error: "INVALID_REQUEST" }, 400)

  const allowed = body.action === "inspect"
    ? ["action", "publicKey", "postHashHex"]
    : body.action === "prepare"
      ? ["action", "publicKey", "postHashHex", "body"]
      : []
  if (!allowed.length || Object.keys(body).some((key) => !allowed.includes(key))) {
    return json({ ok: false, error: "INVALID_REQUEST" }, 400)
  }

  const publicKey = body.publicKey
  const postHashHex = typeof body.postHashHex === "string" ? body.postHashHex.trim() : body.postHashHex
  if (!validPublicKey(publicKey)) return json({ ok: false, error: "INVALID_PUBLIC_KEY" }, 400)
  if (!validPostHash(postHashHex)) return json({ ok: false, error: "INVALID_POST_HASH" }, 400)

  let owned
  try { owned = await loadOwnedPost(postHashHex.toLowerCase(), publicKey) }
  catch { return json({ ok: false, error: "DESO_POST_LOOKUP_UNAVAILABLE" }, 503) }
  if ("error" in owned) return json({ ok: false, error: owned.error }, owned.error === "POST_NOT_OWNED_BY_ACTIVE_KEY" ? 403 : 409)

  if (body.action === "inspect") {
    return json({ ok: true, editable: true, post: owned.post, writeAuthorized: false })
  }

  const text = typeof body.body === "string" ? body.body.trim() : ""
  if (!text || text.length > MAX_POST_LENGTH || text.includes("\u0000")) {
    return json({ ok: false, error: "INVALID_POST_BODY" }, 400)
  }

  const configuredRate = Number(process.env.DESO_MIN_FEE_RATE_NANOS_PER_KB)
  const minFeeRate = Number.isFinite(configuredRate) && configuredRate > 0
    ? Math.trunc(configuredRate)
    : DEFAULT_MIN_FEE_RATE_NANOS_PER_KB

  try {
    const response = await fetchDeSo("submit-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        UpdaterPublicKeyBase58Check: publicKey,
        PostHashHexToModify: owned.post.postHashHex,
        ParentStakeID: owned.post.parentStakeID,
        RepostedPostHashHex: "",
        Title: "",
        BodyObj: { Body: text, ImageURLs: owned.post.imageUrls, VideoURLs: owned.post.videoUrls },
        PostExtraData: { ...owned.post.postExtraData, ViaClient: "viadeso.online" },
        Sub: "",
        IsHidden: false,
        MinFeeRateNanosPerKB: minFeeRate,
        TransactionFees: [],
      }),
    })
    if (!response.ok) return json({ ok: false, error: "DESO_EDIT_PREPARE_REJECTED" }, 502)
    const data = await response.json() as Record<string, unknown>
    if (!validHex(data.TransactionHex)) return json({ ok: false, error: "INVALID_PREPARED_TRANSACTION" }, 502)
    return json({
      ok: true,
      transactionHex: data.TransactionHex,
      feeNanos: typeof data.FeeNanos === "number" && Number.isFinite(data.FeeNanos) ? data.FeeNanos : null,
      writeAuthorized: false,
      preservedMedia: { images: owned.post.imageUrls.length, videos: owned.post.videoUrls.length },
    })
  } catch {
    return json({ ok: false, error: "DESO_EDIT_PREPARE_UNAVAILABLE" }, 503)
  }
}
