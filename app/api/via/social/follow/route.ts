import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../../deso-api"

export const dynamic = "force-dynamic"


function noStore(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } })
}

function validPublicKey(value: unknown): value is string {
  return typeof value === "string" && value.length >= 40 && value.length <= 128 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(value)
}


export async function GET(request: Request) {
  const url = new URL(request.url)
  const followerPublicKey = url.searchParams.get("follower")
  const followedPublicKey = url.searchParams.get("followed")

  if (!validPublicKey(followerPublicKey)) return noStore({ ok: false, error: "INVALID_FOLLOWER_PUBLIC_KEY" }, 400)
  if (!validPublicKey(followedPublicKey)) return noStore({ ok: false, error: "INVALID_FOLLOWED_PUBLIC_KEY" }, 400)
  if (followerPublicKey === followedPublicKey) return noStore({ ok: true, following: false, self: true })

  try {
    const response = await fetchDeSo("is-following-public-key", {
      method: "POST",
      headers: { "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        PublicKeyBase58Check: followerPublicKey,
        IsFollowingPublicKeyBase58Check: followedPublicKey,
      }),
    })
    if (!response.ok) return noStore({ ok: false, error: "DESO_STATUS_REJECTED" }, 502)
    const data = await response.json() as Record<string, unknown>
    if (typeof data.IsFollowing !== "boolean") return noStore({ ok: false, error: "INCOMPLETE_DESO_STATUS" }, 502)
    return noStore({ ok: true, following: data.IsFollowing })
  } catch {
    return noStore({ ok: false, error: "DESO_STATUS_UNAVAILABLE" }, 503)
  }
}
