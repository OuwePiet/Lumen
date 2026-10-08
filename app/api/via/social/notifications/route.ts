import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../../deso-api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const PUBLIC_KEY_RE = /^[1-9A-HJ-NP-Za-km-z]{20,100}$/

type NotificationRequest = {
  publicKey?: unknown
  fetchStartIndex?: unknown
  numToFetch?: unknown
  action?: unknown
}

function parseInteger(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== "number" || !Number.isInteger(value)) return fallback
  return Math.min(max, Math.max(min, value))
}

export async function POST(request: Request) {
  let body: NotificationRequest
  try {
    body = await request.json() as NotificationRequest
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 })
  }

  const publicKey = typeof body.publicKey === "string" ? body.publicKey.trim() : ""
  if (!PUBLIC_KEY_RE.test(publicKey)) {
    return NextResponse.json({ ok: false, error: "INVALID_PUBLIC_KEY" }, { status: 400 })
  }

  if (body.action === "unread") {
    try {
      const response = await fetchDeSo("get-unread-notifications-count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ PublicKeyBase58Check: publicKey }),
        cache: "no-store",
      })
      if (!response.ok) {
        return NextResponse.json({ ok: false, error: "DESO_UNREAD_COUNT_UNAVAILABLE" }, { status: 502 })
      }
      const data = await response.json() as Record<string, unknown>
      const count = data.NotificationsCount
      if (typeof count !== "number" || !Number.isSafeInteger(count) || count < 0) {
        return NextResponse.json({ ok: false, error: "INVALID_DESO_UNREAD_COUNT" }, { status: 502 })
      }
      return NextResponse.json({
        ok: true,
        source: "deso-get-unread-notifications-count",
        unreadCount: count,
        lastUnreadNotificationIndex: typeof data.LastUnreadNotificationIndex === "number" ? data.LastUnreadNotificationIndex : null,
        updateMetadata: data.UpdateMetadata === true,
      }, { headers: { "Cache-Control": "no-store" } })
    } catch {
      return NextResponse.json({ ok: false, error: "DESO_UNREAD_COUNT_UNAVAILABLE" }, { status: 503 })
    }
  }

  const fetchStartIndex = parseInteger(body.fetchStartIndex, -1, -1, Number.MAX_SAFE_INTEGER)
  const numToFetch = parseInteger(body.numToFetch, 40, 1, 50)

  try {
    const response = await fetchDeSo("get-notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        PublicKeyBase58Check: publicKey,
        FetchStartIndex: fetchStartIndex,
        NumToFetch: numToFetch,
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: "DESO_NOTIFICATIONS_UNAVAILABLE" },
        { status: response.status >= 500 ? 503 : 502 },
      )
    }

    const data = await response.json() as Record<string, unknown>
    const notifications = Array.isArray(data.Notifications) ? data.Notifications : []

    return NextResponse.json({
      ok: true,
      source: "deso-get-notifications",
      readOnly: true,
      lastSeenIndex: typeof data.LastSeenIndex === "number" ? data.LastSeenIndex : null,
      notifications,
    }, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return NextResponse.json({ ok: false, error: "DESO_NOTIFICATIONS_UNAVAILABLE" }, { status: 503 })
  }
}
