import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../deso-api"

export const dynamic = "force-dynamic"

type Post = {
  PostHashHex?: string
  Body?: string
  PostExtraData?: Record<string, unknown>
  ExtraData?: Record<string, unknown>
}

export async function GET() {
  try {
    const [profileResponse, postsResponse] = await Promise.all([
      fetchDeSo("get-single-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ PublicKeyBase58Check: "", Username: "OuwePiet" }),
        cache: "no-store",
      }),
      fetchDeSo("get-posts-for-public-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          PublicKeyBase58Check: "",
          Username: "OuwePiet",
          ReaderPublicKeyBase58Check: "",
          NumToFetch: 25,
          MediaRequired: false,
        }),
        cache: "no-store",
      }),
    ])

    if (!profileResponse.ok) return NextResponse.json({ ok: false }, { status: 503 })
    const profileData = await profileResponse.json() as { Profile?: { PublicKeyBase58Check?: unknown } }
    const publicKey = profileData.Profile?.PublicKeyBase58Check
    if (typeof publicKey !== "string" || publicKey.length < 40) return NextResponse.json({ ok: false }, { status: 503 })

    let postHash: string | null = null
    if (postsResponse.ok) {
      const postsData = await postsResponse.json() as { Posts?: Post[] }
      const posts = Array.isArray(postsData.Posts) ? postsData.Posts : []
      const marked = posts.find((post) => {
        const extra = post.PostExtraData ?? post.ExtraData
        return extra && typeof extra === "object" && !Array.isArray(extra) && String(extra.ViaSponsorPlatform ?? "").trim() === "1"
      })
      const named = posts.find((post) => /sponsors+via|sponsors+platform/i.test(post.Body ?? ""))
      const fallback = posts.find((post) => typeof post.PostHashHex === "string" && /^[0-9a-fA-F]{64}$/.test(post.PostHashHex))
      const selected = marked ?? named ?? fallback
      if (selected && typeof selected.PostHashHex === "string" && /^[0-9a-fA-F]{64}$/.test(selected.PostHashHex)) postHash = selected.PostHashHex
    }

    return NextResponse.json(
      { ok: true, publicKey, postHash },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}
