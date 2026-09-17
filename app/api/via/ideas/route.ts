import { createHash } from "node:crypto"
import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../deso-api"
import { isViaIdeasStorageConfigured, listPrivateJson, putPrivateJson } from "../../../via-private-blob"

export const dynamic = "force-dynamic"

const categories = new Set(["NFT", "Social", "Music", "VIA LIVE", "Games", "Discovery", "Safety", "Accessibility", "Other"])
const PUBLIC_KEY_RE = /^[1-9A-HJ-NP-Za-km-z]{20,100}$/

async function resolveOwnerPublicKey() {
  try {
    const response = await fetchDeSo("get-single-profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ PublicKeyBase58Check: "", Username: "OuwePiet" }),
      cache: "no-store",
    })
    if (!response.ok) return null
    const data = await response.json() as { Profile?: { PublicKeyBase58Check?: unknown } }
    const key = data.Profile?.PublicKeyBase58Check
    return typeof key === "string" && PUBLIC_KEY_RE.test(key) ? key : null
  } catch {
    return null
  }
}

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown"
}

function minuteBucket() {
  return Math.floor(Date.now() / 60_000)
}

function anonymousFingerprint(request: Request) {
  return createHash("sha256").update(`${clientIp(request)}:${minuteBucket()}:via-ideas`).digest("hex").slice(0, 20)
}

async function validateOwnerJwt(publicKey: string, jwt: string) {
  try {
    const response = await fetchDeSo("get-user-global-metadata", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ UserPublicKeyBase58Check: publicKey, JWT: jwt }),
      cache: "no-store",
    })
    return response.ok
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  if (!isViaIdeasStorageConfigured()) {
    return NextResponse.json({ ok: false, configured: false, error: "IDEAS_STORAGE_NOT_CONFIGURED" }, { status: 503, headers: { "Cache-Control": "no-store" } })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 })
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: "INVALID_IDEA" }, { status: 400 })
  }

  const record = body as Record<string, unknown>
  const category = typeof record.category === "string" && categories.has(record.category) ? record.category : "Other"
  const idea = typeof record.idea === "string" ? record.idea.trim().slice(0, 2000) : ""
  const website = typeof record.website === "string" ? record.website.trim() : ""

  // Honeypot: legitimate clients leave this hidden field empty.
  if (website) return NextResponse.json({ ok: true, accepted: true }, { status: 202 })
  if (idea.length < 4) return NextResponse.json({ ok: false, error: "IDEA_TOO_SHORT" }, { status: 400 })

  const createdAt = new Date().toISOString()
  const fingerprint = anonymousFingerprint(request)
  const item = {
    category,
    idea,
    createdAt,
    status: "Received",
    source: "VIA Ideas Box",
  }

  // One central submission per IP/minute. The deterministic pathname and
  // allowOverwrite=false make duplicate writes in the same minute fail safely.
  const result = await putPrivateJson(`via-ideas/${minuteBucket()}-${fingerprint}.json`, item)
  if (!result.ok) {
    const status = result.reason === "RATE_LIMITED" ? 429 : 503
    return NextResponse.json({ ok: false, configured: true, error: result.reason }, { status, headers: { "Cache-Control": "no-store" } })
  }

  return NextResponse.json({ ok: true, accepted: true }, { status: 201, headers: { "Cache-Control": "no-store" } })
}

export async function GET(request: Request) {
  if (!isViaIdeasStorageConfigured()) {
    return NextResponse.json({ ok: true, configured: false, items: [] }, { status: 200, headers: { "Cache-Control": "no-store" } })
  }

  const ownerPublicKey = await resolveOwnerPublicKey()
  if (!ownerPublicKey) return NextResponse.json({ ok: false, error: "OWNER_UNAVAILABLE" }, { status: 503 })

  const suppliedKey = request.headers.get("x-via-owner-public-key")?.trim() || ""
  const authorization = request.headers.get("authorization") || ""
  const jwt = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : ""

  if (suppliedKey !== ownerPublicKey || !jwt) {
    return NextResponse.json({ ok: false, error: "OWNER_AUTH_REQUIRED" }, { status: 401, headers: { "Cache-Control": "no-store" } })
  }

  if (!(await validateOwnerJwt(ownerPublicKey, jwt))) {
    return NextResponse.json({ ok: false, error: "OWNER_AUTH_INVALID" }, { status: 403, headers: { "Cache-Control": "no-store" } })
  }

  const result = await listPrivateJson("via-ideas/", 100)
  if (!result.ok) {
    return NextResponse.json({ ok: false, configured: true, error: result.reason }, { status: 503, headers: { "Cache-Control": "no-store" } })
  }

  const items = result.items
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object" && !Array.isArray(item)))
    .map((item) => ({
      category: typeof item.category === "string" ? item.category : "Other",
      idea: typeof item.idea === "string" ? item.idea : "",
      createdAt: typeof item.createdAt === "string" ? item.createdAt : "",
      status: typeof item.status === "string" ? item.status : "Received",
      source: "central",
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return NextResponse.json({ ok: true, configured: true, items }, { status: 200, headers: { "Cache-Control": "no-store" } })
}
