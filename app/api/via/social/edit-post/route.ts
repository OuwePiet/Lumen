import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../../deso-api"

export const dynamic = "force-dynamic"


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


function safeUrls(value: unknown) {
  if (value == null) return [] as string[]
  if (!Array.isArray(value)) return null
  const result: string[] = []
  for (const item of value) {
    if (typeof item !== "string" || item.length === 0) return null
    result.push(item)
  }
  return result
}

function safeExtraData(value: unknown) {
  const source = record(value)
  if (!source) return {} as Record<string, string>
  const output: Record<string, string> = Object.create(null)
  for (const [key, item] of Object.entries(source)) {
    if (typeof item !== "string") throw new Error("INVALID_POST_METADATA")
    output[key] = item
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

  const imageUrls = safeUrls(post.ImageURLs)
  const videoUrls = safeUrls(post.VideoURLs)
  if (!imageUrls || !videoUrls) return { error: "UNSAFE_EXISTING_MEDIA" as const }

  return {
    post: {
      postHashHex: typeof post.PostHashHex === "string" ? post.PostHashHex : postHashHex,
      body: typeof post.Body === "string" ? post.Body : "",
      parentStakeID: typeof post.ParentStakeID === "string" ? post.ParentStakeID : "",
      isHidden: post.IsHidden === true,
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

  const allowed = ["action", "publicKey", "postHashHex"]
  if(body.action !== "inspect" || Object.keys(body).some(key=>!allowed.includes(key))) return json({ok:false,error:"INVALID_REQUEST"},400)

  const publicKey = body.publicKey
  const postHashHex = typeof body.postHashHex === "string" ? body.postHashHex.trim() : body.postHashHex
  if (!validPublicKey(publicKey)) return json({ ok: false, error: "INVALID_PUBLIC_KEY" }, 400)
  if (!validPostHash(postHashHex)) return json({ ok: false, error: "INVALID_POST_HASH" }, 400)

  let owned
  try { owned = await loadOwnedPost(postHashHex.toLowerCase(), publicKey) }
  catch { return json({ ok: false, error: "DESO_POST_LOOKUP_UNAVAILABLE" }, 503) }
  if ("error" in owned) return json({ ok: false, error: owned.error }, owned.error === "POST_NOT_OWNED_BY_ACTIVE_KEY" ? 403 : 409)

  return json({ ok: true, editable: true, post: owned.post })
}
