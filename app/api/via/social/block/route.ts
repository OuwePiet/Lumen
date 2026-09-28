import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../../deso-api"

export const dynamic = "force-dynamic"

function noStore(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } })
}

function validPublicKey(value: unknown): value is string {
  return typeof value === "string" && value.length >= 40 && value.length <= 128 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(value)
}

function validJwt(value: unknown): value is string {
  return typeof value === "string" && value.length >= 32 && value.length <= 8192 && !/\s/.test(value)
}

export async function POST(request: Request) {
  let input: unknown
  try { input = await request.json() } catch { return noStore({ ok: false, error: "INVALID_JSON" }, 400) }
  if (!input || typeof input !== "object" || Array.isArray(input)) return noStore({ ok: false, error: "INVALID_REQUEST" }, 400)

  const body = input as Record<string, unknown>
  const publicKey = body.publicKey
  const blockedPublicKey = body.blockedPublicKey
  const jwt = body.jwt

  if (!validPublicKey(publicKey)) return noStore({ ok: false, error: "INVALID_PUBLIC_KEY" }, 400)
  if (!validPublicKey(blockedPublicKey)) return noStore({ ok: false, error: "INVALID_BLOCKED_PUBLIC_KEY" }, 400)
  if (publicKey === blockedPublicKey) return noStore({ ok: false, error: "SELF_BLOCK_NOT_ALLOWED" }, 400)
  if (!validJwt(jwt)) return noStore({ ok: false, error: "INVALID_JWT" }, 400)

  try {
    const response = await fetchDeSo("block-public-key", {
      method: "POST",
      headers: { "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        PublicKeyBase58Check: publicKey,
        BlockPublicKeyBase58Check: blockedPublicKey,
        Unblock: body.unblock === true,
        JWT: jwt,
      }),
    })
    if (!response.ok) return noStore({ ok: false, error: "DESO_BLOCK_REJECTED" }, 502)
    const data = await response.json() as Record<string, unknown>
    return noStore({ ok: true, blockedPublicKeys: data.BlockedPublicKeys ?? {} })
  } catch {
    return noStore({ ok: false, error: "DESO_BLOCK_UNAVAILABLE" }, 503)
  }
}
