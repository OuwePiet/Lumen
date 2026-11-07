"use client"

import Image from "next/image"
import { useEffect, useState, type CSSProperties } from "react"

type NFTMediaProps = {
  imageUrl?: string
  videoUrl?: string
  alt: string
  imageStyle: CSSProperties
  placeholderStyle: CSSProperties
  sensitive?: boolean
}

type MediaKind = "image" | "video" | "audio" | "file"
type MediaCandidate = { url: string; kind: MediaKind }

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".m4v"]
const AUDIO_EXTENSIONS = [".mp3", ".wav", ".m4a", ".aac", ".flac", ".oga"]
const FILE_EXTENSIONS = [".pdf", ".zip", ".epub", ".txt", ".csv", ".docx", ".xlsx", ".pptx", ".glb", ".gltf"]

const mediaWrapperStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
}

const mediaBadgeStyle: CSSProperties = {
  position: "absolute",
  top: "12px",
  left: "12px",
  zIndex: 1,
  color: "#8fd4a9",
  background: "rgba(5, 8, 7, 0.88)",
  border: "1px solid #285f40",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.06em",
  padding: "5px 9px",
  pointerEvents: "none",
}

function MediaBadge({ label }: { label: string }) {
  return <span style={mediaBadgeStyle}>{label}</span>
}

function filePath(url: string) {
  return url.split(/[?#]/, 1)[0].toLowerCase()
}

function mediaKind(url: string, suppliedAsVideo: boolean): MediaKind {
  const path = filePath(url)
  if (FILE_EXTENSIONS.some((extension) => path.endsWith(extension))) return "file"

  if (AUDIO_EXTENSIONS.some((extension) => path.endsWith(extension))) {
    return "audio"
  }

  if (
    suppliedAsVideo ||
    VIDEO_EXTENSIONS.some((extension) => path.endsWith(extension))
  ) {
    return "video"
  }

  return "image"
}

function safeHttpsUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === "https:" && !parsed.username && !parsed.password ? parsed.toString() : null
  } catch {
    return null
  }
}

function safeIpfsPath(value: string) {
  const clean = value.replace(/^\/+/, "")
  if (!clean || clean.length > 4096) return null
  if (/[\u0000-\u001f\u007f\\]/.test(clean)) return null

  const pathOnly = clean.split(/[?#]/, 1)[0]
  const segments = pathOnly.split("/")
  if (segments.some((segment) => segment === ".." || segment === ".")) return null

  return clean
}

function mediaCandidates(url?: string) {
  if (!url) return []

  const trimmed = url.trim()
  const lower = trimmed.toLowerCase()
  const ipfsPrefix = "ipfs://"
  const ipfsMarker = "/ipfs/"
  const markerIndex = lower.indexOf(ipfsMarker)
  const rawIpfsPath = lower.startsWith(ipfsPrefix)
    ? trimmed.slice(ipfsPrefix.length)
    : markerIndex >= 0
      ? trimmed.slice(markerIndex + ipfsMarker.length)
      : null

  if (rawIpfsPath) {
    const cleanPath = safeIpfsPath(rawIpfsPath)
    if (!cleanPath) return []

    return [
      `https://ipfs.io/ipfs/${cleanPath}`,
      `https://dweb.link/ipfs/${cleanPath}`,
    ]
  }

  const safeUrl = safeHttpsUrl(trimmed)
  return safeUrl ? [safeUrl] : []
}

export function buildCandidates(imageUrl?: string, videoUrl?: string): MediaCandidate[] {
  const candidates: MediaCandidate[] = []
  const seen = new Set<string>()

  const append = (source: string | undefined, suppliedAsVideo: boolean) => {
    if (!source) return
    const kind = mediaKind(source, suppliedAsVideo)
    for (const url of mediaCandidates(source)) {
      const key = `${kind}:${url}`
      if (seen.has(key)) continue
      seen.add(key)
      candidates.push({ url, kind })
    }
  }

  append(videoUrl, true)
  append(imageUrl, false)
  return candidates
}

function passthroughLoader({ src }: { src: string }) {
  return src
}

export default function NFTMedia({
  imageUrl,
  videoUrl,
  alt,
  imageStyle,
  placeholderStyle,
  sensitive = false,
}: NFTMediaProps) {
  const sourceKey = `${videoUrl ?? ""}|${imageUrl ?? ""}`
  const candidates = buildCandidates(imageUrl, videoUrl)
  const [candidateIndex, setCandidateIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    setCandidateIndex(0)
    setRevealed(false)
  }, [sourceKey])

  if (candidates.length === 0) {
    return (
      <div style={{ ...placeholderStyle, position: "relative" }}>
        <MediaBadge label="Media unavailable" />
        <span>No safe media source available</span>
      </div>
    )
  }

  if (candidateIndex >= candidates.length) {
    return (
      <div style={{ ...placeholderStyle, position: "relative" }}>
        <MediaBadge label="Media unavailable" />
        <span>De browser kan dit bestand niet weergeven.</span>
        <a href={candidates[0].url} target="_blank" rel="noopener noreferrer" style={{ color: "#9adbb2", padding: 12 }}>Open oorspronkelijk bestand</a>
      </div>
    )
  }

  const current = candidates[candidateIndex]
  const tryNextCandidate = () =>
    setCandidateIndex((currentIndex) => currentIndex + 1)

  if (sensitive && !revealed) {
    return (
      <div style={{ ...placeholderStyle, position: "relative", overflow: "hidden" }}>
        {current.kind === "image" ? (
          <Image
            src={current.url}
            alt=""
            width={600}
            height={600}
            sizes="(max-width: 600px) 100vw, 600px"
            loader={passthroughLoader}
            unoptimized
            aria-hidden="true"
            style={{ ...imageStyle, filter: "blur(24px)", transform: "scale(1.08)", opacity: .34 }}
            onError={tryNextCandidate}
          />
        ) : null}
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 20, background: "rgba(5,8,7,.68)", textAlign: "center" }}>
          <div>
            <MediaBadge label="Sensitive content" />
            <p style={{ margin: "0 0 12px", color: "#e4ece7", fontWeight: 700 }}>Expliciete / gevoelige inhoud</p>
            <p style={{ margin: "0 0 14px", color: "#aebbb4", fontSize: 12, lineHeight: 1.5 }}>Deze creator heeft de media als expliciet of gevoelig gemarkeerd.</p>
            <button type="button" onClick={() => setRevealed(true)} style={{ minHeight: 38, border: "1px solid rgba(143,212,169,.42)", borderRadius: 999, padding: "8px 13px", background: "rgba(11,28,18,.92)", color: "#b9e8c9", fontWeight: 750, cursor: "pointer" }}>
              Toon gevoelige inhoud
            </button>
          </div>
        </div>
      </div>
    )
  }
  if (current.kind === "file") {
    return <div style={{ ...placeholderStyle, position: "relative", padding: 24, flexDirection: "column", gap: 16 }}>
      <MediaBadge label="Bestand" />
      <p style={{ overflowWrap: "anywhere" }}>{alt}</p>
      <a href={current.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", minHeight: 44, padding: "10px 16px", color: "#9adbb2", border: "1px solid #285f40", borderRadius: 12 }}>Open oorspronkelijk bestand</a>
      <p style={{ fontSize: 12, color: "#aebbb4" }}>Opent bij de gekozen opslagprovider. Ondersteuning hangt af van het bestand en je apparaat.</p>
    </div>
  }

  if (current.kind === "video") {
    return (
      <div style={mediaWrapperStyle}>
        <MediaBadge label="Video" />
        <video
          key={current.url}
          src={current.url}
          aria-label={alt}
          controls
          playsInline
          preload="metadata"
          style={imageStyle}
          onError={tryNextCandidate}
        />
      </div>
    )
  }

  if (current.kind === "audio") {
    return (
      <div style={{ ...placeholderStyle, position: "relative" }}>
        <MediaBadge label="Audio" />
        <audio
          key={current.url}
          src={current.url}
          aria-label={alt}
          controls
          preload="metadata"
          style={{ width: "calc(100% - 40px)" }}
          onError={tryNextCandidate}
        />
      </div>
    )
  }

  return (
    <div style={mediaWrapperStyle}>
      <MediaBadge label="Image" />
      <Image
        key={current.url}
        src={current.url}
        alt={alt}
        width={600}
        height={600}
        sizes="(max-width: 600px) 100vw, 600px"
        loader={passthroughLoader}
        unoptimized
        style={imageStyle}
        onError={tryNextCandidate}
      />
    </div>
  )
}
