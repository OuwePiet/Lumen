import { NextResponse } from "next/server"

// @OuwePiet 2026: GDELT discovers outbound article links only; it does not license or verify articles.
// A small, bounded query avoids cost and prevents this endpoint from becoming an arbitrary proxy.
export const dynamic = "force-dynamic"
// Worldwide topic sample, not a Netherlands-only discovery query and not exhaustive global coverage.
// Discovery is never treated as approved or geographically verified news.
const ENDPOINT = "https://api.gdeltproject.org/api/v2/doc/doc?query=%28climate%20OR%20science%20OR%20culture%20OR%20health%20OR%20elections%29&mode=ArtList&format=json&maxrecords=12&timespan=1d&sort=DateDesc"
type Article = { title: string; url: string; domain: string; seenAt: string }
export async function GET() {
  try {
    const response = await fetch(ENDPOINT, { signal: AbortSignal.timeout(8000), redirect: "error", cache: "no-store" })
    if (response.status === 429) return NextResponse.json({ status: "source-rate-limited", provider: "GDELT", articles: [] }, { headers: { "Cache-Control": "no-store" } })
    if (!response.ok || Number(response.headers.get("content-length") || 0) > 100000) throw Error("upstream")
    const text = await response.text()
    if (text.length > 100000) throw Error("size")
    const payload: unknown = JSON.parse(text)
    const raw = payload && typeof payload === "object" && "articles" in payload ? (payload as { articles: unknown }).articles : null
    if (!Array.isArray(raw)) throw Error("format")
    const articles: Article[] = []
    const seen = new Set<string>()
    for (const item of raw.slice(0, 20)) {
      if (!item || typeof item !== "object") continue
      const a = item as Record<string, unknown>
      if (typeof a.title !== "string" || typeof a.url !== "string" || typeof a.domain !== "string" || typeof a.seendate !== "string") continue
      let url: URL
      try { url = new URL(a.url) } catch { continue }
      if (url.protocol !== "https:" || url.username || url.password || url.port || url.hostname.startsWith("[") || /^[0-9.]+$/.test(url.hostname)) continue
      if (!/^\d{8}T\d{6}Z$/.test(a.seendate)) continue
      const title = a.title.replace(/<[^>]*>/g, " ").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 180)
      if (!title || seen.has(url.href)) continue
      seen.add(url.href)
      articles.push({ title, url: url.href, domain: url.hostname, seenAt: a.seendate })
    }
    return NextResponse.json({ status: "discovery-unverified", provider: "GDELT", articles }, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return NextResponse.json({ status: "temporarily-unavailable", provider: "GDELT", articles: [] }, { headers: { "Cache-Control": "no-store" } })
  }
}