import { NextResponse } from "next/server"
import { readDiscoveryPosts } from "../../../../../lib/via/deso-discovery-read"

export const dynamic = "force-dynamic"

const VIA_CLIENT = "viadeso.online"

function isViaPost(post: Awaited<ReturnType<typeof readDiscoveryPosts>>[number]) {
  return post.postExtraData?.ViaClient === VIA_CLIENT
}

export async function GET() {
  try {
    // Read at most three pages. Some nodes can return overlapping results.
    const sampled = new Map<string, Awaited<ReturnType<typeof readDiscoveryPosts>>[number]>()
    for (let page = 0; page < 3; page++) {
      const batch = await readDiscoveryPosts(30, true, [...sampled.keys()]).catch(() => [])
      const before = sampled.size
      for (const post of batch) sampled.set(post.postHash, post)
      if (sampled.size === before) break
    }
    const posts = [...sampled.values()]
    // The public feed normally contains posts. Never report a failed upstream
    // read (which also returns []) as a misleading zero activity count.
    if (posts.length === 0) {
      return NextResponse.json(
        { ok: false, error: "VIA_ACTIVITY_SOURCE_UNAVAILABLE" },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      )
    }
    // Counts below describe only the inspected recent feed, not all VIA activity.
    const viaPosts = posts.filter(isViaPost)
    const creators = new Set(viaPosts.map((post) => post.publicKey).filter(Boolean))
    const nftPosts = viaPosts.filter((post) => post.isNft)

    const tags = new Map<string, number>()
    for (const post of viaPosts) { for (const tag of new Set((post.body.match(/#[\p{L}\p{N}_]{1,40}/gu) ?? []).map(value => value.slice(1).toLocaleLowerCase()))) tags.set(tag, (tags.get(tag) ?? 0) + 1) }
    const trends = [...tags].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag, count]) => ({ tag, count }))
    const recentCreators = [...new Map(viaPosts.filter(post => /^[1-9A-HJ-NP-Za-km-z]{40,128}$/.test(post.publicKey)).map(post => [post.publicKey, { publicKey: post.publicKey, username: post.username }])).values()].slice(0, 5)
    return NextResponse.json(
      {
        ok: true,
        measuredAt: new Date().toISOString(), trends, recentCreators,
        source: "deso-new-feed",
        scope: "bounded-recent-via-posts",
        sampledPosts: posts.length,
        activity: {
          posts: viaPosts.length,
          creators: creators.size,
          nftPosts: nftPosts.length,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=120",
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
