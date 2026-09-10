import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../../deso-api"

export const dynamic = "force-dynamic"

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(["image/gif", "image/jpeg", "image/png", "image/webp"])

function noStore(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } })
}

function validPublicKey(value: unknown): value is string {
  return typeof value === "string" && value.length >= 40 && value.length <= 128 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(value)
}

function validJwt(value: unknown): value is string {
  return typeof value === "string" && value.length >= 32 && value.length <= 8192 && !/\s/.test(value)
}

function validHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > 2048) return false
  try {
    const url = new URL(value)
    return url.protocol === "https:" && !url.username && !url.password
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  let incoming: FormData
  try {
    incoming = await request.formData()
  } catch {
    return noStore({ ok: false, error: "INVALID_MULTIPART" }, 400)
  }

  const publicKey = incoming.get("publicKey")
  const jwt = incoming.get("jwt")
  const file = incoming.get("file")

  if (!validPublicKey(publicKey)) return noStore({ ok: false, error: "INVALID_PUBLIC_KEY" }, 400)
  if (!validJwt(jwt)) return noStore({ ok: false, error: "INVALID_JWT" }, 400)
  if (!(file instanceof File)) return noStore({ ok: false, error: "INVALID_FILE" }, 400)
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return noStore({ ok: false, error: "UNSUPPORTED_IMAGE_TYPE" }, 415)
  if (file.size <= 0 || file.size >= MAX_IMAGE_BYTES) return noStore({ ok: false, error: "INVALID_IMAGE_SIZE" }, 413)

  const outbound = new FormData()
  outbound.set("UserPublicKeyBase58Check", publicKey)
  outbound.set("JWT", jwt)
  outbound.set("file", file, file.name || "via-image")

  try {
    const response = await fetchDeSo("upload-image", { method: "POST", body: outbound })
    if (!response.ok) return noStore({ ok: false, error: "DESO_IMAGE_UPLOAD_REJECTED" }, 502)

    const data = await response.json() as Record<string, unknown>
    const imageUrl = data.ImageURL
    if (!validHttpsUrl(imageUrl)) return noStore({ ok: false, error: "INVALID_DESO_IMAGE_URL" }, 502)

    return noStore({ ok: true, imageUrl })
  } catch {
    return noStore({ ok: false, error: "DESO_IMAGE_UPLOAD_UNAVAILABLE" }, 503)
  }
}
