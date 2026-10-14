import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../../deso-api"
import { isViaIdeasStorageConfigured, listPrivateJson, putPrivateJson } from "../../../../via-private-blob"

export const dynamic = "force-dynamic"
const KEY_RE = /^[1-9A-HJ-NP-Za-km-z]{20,100}$/
const NO_STORE = { "Cache-Control": "no-store" }

async function authorized(request: Request) {
  const key = request.headers.get("x-via-owner-public-key")?.trim() || ""
  const auth = request.headers.get("authorization") || ""
  const jwt = auth.startsWith("Bearer ") ? auth.slice(7).trim() : ""
  if (!KEY_RE.test(key) || !jwt) return false
  try {
    const owner = await fetchDeSo("get-single-profile", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ PublicKeyBase58Check: "", Username: "OuwePiet" }), cache: "no-store",
    })
    if (!owner.ok) return false
    const profile = await owner.json() as { Profile?: { PublicKeyBase58Check?: string } }
    if (profile.Profile?.PublicKeyBase58Check !== key) return false
    const verification = await fetchDeSo("get-user-global-metadata", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ UserPublicKeyBase58Check: key, JWT: jwt }), cache: "no-store",
    })
    return verification.ok
  } catch { return false }
}

export async function GET(request: Request) {
  if (!(await authorized(request))) return NextResponse.json({ ok: false }, { status: 403, headers: NO_STORE })
  if (!isViaIdeasStorageConfigured()) return NextResponse.json({ ok: false }, { status: 503, headers: NO_STORE })
  const result = await listPrivateJson("via-ideas-seen/", 100)
  if (!result.ok) return NextResponse.json({ ok: false }, { status: 503, headers: NO_STORE })
  const latest = result.items.reduce<string>((max, item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return max
    const seen = (item as Record<string, unknown>).seenAt
    return typeof seen === "string" && /^\d{4}-\d{2}-\d{2}T/.test(seen) && seen > max ? seen : max
  }, "")
  return NextResponse.json({ ok: true, seenAt: latest }, { headers: NO_STORE })
}

export async function POST(request: Request) {
  if (!(await authorized(request))) return NextResponse.json({ ok: false }, { status: 403, headers: NO_STORE })
  if (!isViaIdeasStorageConfigured()) return NextResponse.json({ ok: false }, { status: 503, headers: NO_STORE })
  const body = await request.json().catch(() => null) as { seenAt?: unknown } | null
  const seenAt = body?.seenAt
  if (typeof seenAt !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(seenAt) || !Number.isFinite(Date.parse(seenAt)) || seenAt > new Date().toISOString()) {
    return NextResponse.json({ ok: false }, { status: 400, headers: NO_STORE })
  }
  // Append-only receipts avoid overwriting an acknowledgment from another device.
  const result = await putPrivateJson(`via-ideas-seen/${Date.now()}-${crypto.randomUUID()}.json`, { seenAt })
  return NextResponse.json({ ok: result.ok }, { status: result.ok ? 201 : 503, headers: NO_STORE })
}
