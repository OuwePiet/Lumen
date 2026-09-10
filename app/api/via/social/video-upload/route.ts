import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const DEFAULT_DESO_NODE = "https://node.deso.org"
const MAX_VIDEO_BYTES = 250 * 1024 * 1024

function noStore(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } })
}

function nodeUrl() {
  const configured = process.env.DESO_NODE || process.env.NEXT_PUBLIC_DESO_NODE
  if (!configured) return DEFAULT_DESO_NODE
  try {
    const url = new URL(configured)
    return url.protocol === "https:" ? url.origin : DEFAULT_DESO_NODE
  } catch {
    return DEFAULT_DESO_NODE
  }
}

function validMediaId(value: unknown): value is string {
  return typeof value === "string" && value.length >= 1 && value.length <= 160 && /^[A-Za-z0-9_-]+$/.test(value)
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

  if (action === "token") {
    const fileSize = body.fileSize
    if (typeof fileSize !== "number" || !Number.isInteger(fileSize) || fileSize <= 0 || fileSize > MAX_VIDEO_BYTES) {
      return noStore({ ok: false, error: "INVALID_VIDEO_SIZE" }, 400)
    }

    try {
      const response = await fetch(`${nodeUrl()}/api/v0/upload-video`, {
        method: "POST",
        headers: {
          "Tus-Resumable": "1.0.0",
          "Upload-Length": String(fileSize),
        },
        cache: "no-store",
      })

      if (!response.ok) return noStore({ ok: false, error: "DESO_VIDEO_TOKEN_REJECTED" }, 502)

      const location = response.headers.get("location")
      const mediaId = response.headers.get("stream-media-id")
      if (!location || !mediaId || !validMediaId(mediaId)) {
        return noStore({ ok: false, error: "INVALID_DESO_VIDEO_TOKEN" }, 502)
      }

      let safeLocation: URL
      try {
        safeLocation = new URL(location)
      } catch {
        return noStore({ ok: false, error: "INVALID_DESO_VIDEO_LOCATION" }, 502)
      }
      if (safeLocation.protocol !== "https:") {
        return noStore({ ok: false, error: "INVALID_DESO_VIDEO_LOCATION" }, 502)
      }

      return noStore({ ok: true, uploadUrl: safeLocation.toString(), mediaId })
    } catch {
      return noStore({ ok: false, error: "DESO_VIDEO_TOKEN_UNAVAILABLE" }, 503)
    }
  }

  if (action === "status") {
    const mediaId = body.mediaId
    if (!validMediaId(mediaId)) return noStore({ ok: false, error: "INVALID_MEDIA_ID" }, 400)

    try {
      const response = await fetch(`${nodeUrl()}/api/v0/get-video-status/${encodeURIComponent(mediaId)}`, {
        method: "GET",
        cache: "no-store",
      })
      if (!response.ok) return noStore({ ok: false, error: "DESO_VIDEO_STATUS_REJECTED" }, 502)
      const data = await response.json() as Record<string, unknown>
      return noStore({ ok: true, ready: data.ReadyToStream === true })
    } catch {
      return noStore({ ok: false, error: "DESO_VIDEO_STATUS_UNAVAILABLE" }, 503)
    }
  }

  return noStore({ ok: false, error: "INVALID_ACTION" }, 400)
}
