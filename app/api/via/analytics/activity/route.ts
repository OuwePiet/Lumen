import { NextResponse } from "next/server"
import { readDiscoveryPosts } from "../../../../../lib/via/deso-discovery-read"

export const dynamic = "force-dynamic"

const VIA_CLIENT = "viadeso.online"

function isViaPost(post: Awaited<ReturnType<typeof readDiscoveryPosts>>[number]) {
  return post.postExtraData?.ViaClient === VIA_CLIENT
}

export async function GET() {
  try {
    // Bounded native DeSo read. General DeSo activity is never counted as VIA activity.
    const posts = await readDiscoveryPosts(30, true)
    // Counts below describe only the inspected recent feed, not all VIA activity.
    const viaPosts = posts.filter(isViaPost)
    const creators = new Set(viaPosts.map((post) => post.publicKey).filter(Boolean))
    const nftPosts = viaPosts.filter((post) => post.isNft)

    return NextResponse.json(
      {
        ok: true,
        source: "deso-new-feed",
        scope: "bounded-recent-via-posts",
        activity: {
          posts: viaPosts.length,
          creators: creators.size,
          nftPosts: nftPosts.length,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=60",
        },
      },
    )
  } catch {
    return NextResponse.json(
      { ok: false, error: "VIA_ACTIVITY_UNAVAILABLE" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }
}
