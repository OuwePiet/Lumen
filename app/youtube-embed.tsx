import type { CSSProperties } from "react"

type YouTubeEmbedProps = {
  text?: string
  title?: string
  maxVideos?: number
}

const wrapperStyle: CSSProperties = {
  display: "grid",
  gap: "12px",
  margin: "18px 0 24px",
}

const frameStyle: CSSProperties = {
  aspectRatio: "16 / 9",
  border: "1px solid #254233",
  borderRadius: "14px",
  overflow: "hidden",
  background: "#000",
}

const iframeStyle: CSSProperties = {
  border: 0,
  display: "block",
  height: "100%",
  width: "100%",
}

function cleanVideoId(value: string | null) {
  if (!value) return null
  const trimmed = value.trim()
  return /^[A-Za-z0-9_-]{11}$/.test(trimmed) ? trimmed : null
}

function videoIdFromUrl(rawUrl: string) {
  try {
    const parsed = new URL(rawUrl)
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "")

    if (host === "youtu.be") {
      return cleanVideoId(parsed.pathname.split("/").filter(Boolean)[0] ?? null)
    }

    if (host !== "youtube.com" && host !== "m.youtube.com") return null

    if (parsed.pathname === "/watch") {
      return cleanVideoId(parsed.searchParams.get("v"))
    }

    const parts = parsed.pathname.split("/").filter(Boolean)
    if (["shorts", "live", "embed"].includes(parts[0] ?? "")) {
      return cleanVideoId(parts[1] ?? null)
    }

    return null
  } catch {
    return null
  }
}

export function youtubeVideoIdsFromText(text?: string, maxVideos = 3) {
  if (!text) return []

  const urls = text.match(/https?:\/\/[^\s<>()]+/gi) ?? []
  const ids: string[] = []

  for (const candidate of urls) {
    const cleaned = candidate.replace(/[.,!?;:'"\]}]+$/, "")
    const id = videoIdFromUrl(cleaned)
    if (id && !ids.includes(id)) ids.push(id)
    if (ids.length >= Math.max(1, Math.min(maxVideos, 6))) break
  }

  return ids
}

export default function YouTubeEmbed({
  text,
  title = "YouTube video shared on VIA",
  maxVideos = 3,
}: YouTubeEmbedProps) {
  const ids = youtubeVideoIdsFromText(text, maxVideos)
  if (ids.length === 0) return null

  return (
    <div style={wrapperStyle} aria-label="YouTube videos shared in this content">
      {ids.map((id, index) => (
        <div key={id} style={frameStyle}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            title={ids.length === 1 ? title : `${title} ${index + 1}`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            style={iframeStyle}
          />
        </div>
      ))}
    </div>
  )
}
