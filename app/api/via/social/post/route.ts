import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../../deso-api"

export const dynamic = "force-dynamic"

const MAX_POST_LENGTH = 5000
const MAX_MEDIA_URL_LENGTH = 2048
const MAX_IMAGE_URLS = 4
const MAX_VIDEO_URLS = 1
const DEFAULT_MIN_FEE_RATE_NANOS_PER_KB = 1000

function noStore(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } })
}

function validPublicKey(value: unknown): value is string {
  return typeof value === "string" && value.length >= 40 && value.length <= 128 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(value)
}

function validHex(value: unknown): value is string {
  return typeof value === "string" && value.length >= 2 && value.length <= 500_000 && value.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(value)
}

function validPostHash(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-fA-F]{64}$/.test(value)
}

function parseHttpsUrls(value: unknown, maxItems: number) {
  if (value === undefined) return [] as string[]
  if (!Array.isArray(value) || value.length > maxItems) return null

  const urls: string[] = []
  for (const item of value) {
    if (typeof item !== "string" || item.length === 0 || item.length > MAX_MEDIA_URL_LENGTH) return null
    try {
      const url = new URL(item)
      if (url.protocol !== "https:" || url.username || url.password) return null
      urls.push(url.toString())
    } catch {
      return null
    }
  }
  return urls
}

export async function POST(request: Request) {
  let input: unknown
  try {
    input = await request.json()
  } catch {
    return noStore({ ok: false, error: "INVALID_JSON" }, 400)
  }

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return noStore({ ok: false, error: "INVALID_REQUEST" }, 400)
  }

  const body = input as Record<string, unknown>
  const action = body.action

  if (action === "prepare") {
    const publicKey = body.publicKey
    const text = typeof body.body === "string" ? body.body.trim() : ""
    const parentStakeID = typeof body.parentStakeID === "string" ? body.parentStakeID.trim() : ""
    const imageUrls = parseHttpsUrls(body.imageUrls, MAX_IMAGE_URLS)
    const videoUrls = parseHttpsUrls(body.videoUrls, MAX_VIDEO_URLS)

    if (!validPublicKey(publicKey)) return noStore({ ok: false, error: "INVALID_PUBLIC_KEY" }, 400)
    if (text.length > MAX_POST_LENGTH || text.includes("\u0000")) return noStore({ ok: false, error: "INVALID_POST_BODY" }, 400)
    if (!imageUrls) return noStore({ ok: false, error: "INVALID_IMAGE_URLS" }, 400)
    if (!videoUrls) return noStore({ ok: false, error: "INVALID_VIDEO_URLS" }, 400)
    if (!text && imageUrls.length === 0 && videoUrls.length === 0) return noStore({ ok: false, error: "EMPTY_POST" }, 400)
    if (parentStakeID && !validPostHash(parentStakeID)) return noStore({ ok: false, error: "INVALID_PARENT_POST" }, 400)

    const configuredRate = Number(process.env.DESO_MIN_FEE_RATE_NANOS_PER_KB)
    const minFeeRate = Number.isFinite(configuredRate) && configuredRate > 0
      ? Math.trunc(configuredRate)
      : DEFAULT_MIN_FEE_RATE_NANOS_PER_KB

    try {
      const response = await fetchDeSo("submit-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UpdaterPublicKeyBase58Check: publicKey,
          PostHashHexToModify: "",
          ParentStakeID: parentStakeID,
          RepostedPostHashHex: "",
          Title: "",
          BodyObj: { Body: text, ImageURLs: imageUrls, VideoURLs: videoUrls },
          PostExtraData: { ViaClient: "viadeso.online" },
          Sub: "",
          IsHidden: false,
          MinFeeRateNanosPerKB: minFeeRate,
          TransactionFees: [],
        }),
      })

      if (!response.ok) return noStore({ ok: false, error: "DESO_PREPARE_REJECTED" }, 502)
      const data = await response.json() as Record<string, unknown>
      const transactionHex = data.TransactionHex
      const feeNanos = data.FeeNanos
      if (!validHex(transactionHex)) return noStore({ ok: false, error: "INVALID_PREPARED_TRANSACTION" }, 502)

      return noStore({
        ok: true,
        transactionHex,
        feeNanos: typeof feeNanos === "number" && Number.isFinite(feeNanos) ? feeNanos : null,
        media: { images: imageUrls.length, videos: videoUrls.length },
      })
    } catch {
      return noStore({ ok: false, error: "DESO_PREPARE_UNAVAILABLE" }, 503)
    }
  }

  if (action === "submit") {
    const signedTransactionHex = body.signedTransactionHex
    if (!validHex(signedTransactionHex)) return noStore({ ok: false, error: "INVALID_SIGNED_TRANSACTION" }, 400)

    try {
      const response = await fetchDeSo("submit-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TransactionHex: signedTransactionHex }),
      })
      if (!response.ok) return noStore({ ok: false, error: "DESO_SUBMIT_REJECTED" }, 502)
      return noStore({ ok: true, transaction: await response.json() as Record<string, unknown> })
    } catch {
      return noStore({ ok: false, error: "DESO_SUBMIT_UNAVAILABLE" }, 503)
    }
  }

  return noStore({ ok: false, error: "INVALID_ACTION" }, 400)
}
