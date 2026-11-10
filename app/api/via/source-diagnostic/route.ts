import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../deso-api"

export const dynamic = "force-dynamic"

// Read-only diagnostic for the one VIA source-attribution test post.
// Do not expose a general-purpose DeSo proxy or accept user-supplied URLs.
const POST_HASH = "dee54cc093fcb3702f74a56bcf806d0baa8e9afdfdbfe11c2610a080cd5d9099"

export async function GET() {
  const headers = { "Cache-Control": "no-store" }
  try {
    const response = await fetchDeSo("get-single-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ PostHashHex: POST_HASH, FetchParents: false, CommentLimit: 0 }),
      cache: "no-store",
    })
    if (!response.ok) {
      return NextResponse.json({ ok: false, postHashHex: POST_HASH, upstreamStatus: response.status }, { status: 502, headers })
    }
    const data = await response.json() as { PostFound?: { PostHashHex?: string; PostExtraData?: Record<string, unknown>; ExtraData?: Record<string, unknown>; Body?: string; PosterPublicKeyBase58Check?: string } }
    const post = data.PostFound
    if (!post || post.PostHashHex?.toLowerCase() !== POST_HASH) {
      return NextResponse.json({ ok: false, error: "POST_NOT_FOUND", postHashHex: POST_HASH }, { status: 404, headers })
    }
    const extraData = post.PostExtraData ?? post.ExtraData ?? {}
    return NextResponse.json({
      ok: true,
      postHashHex: POST_HASH,
      bodyMatchesTest: post.Body?.includes("VIA bronherkenning test 56") ?? false,
      sourceFields: { Node: extraData.Node ?? null, app: extraData.app ?? null, ViaClient: extraData.ViaClient ?? null },
      extraData,
    }, { headers })
  } catch {
    return NextResponse.json({ ok: false, error: "PUBLIC_DESO_READ_UNAVAILABLE", postHashHex: POST_HASH }, { status: 503, headers })
  }
}
