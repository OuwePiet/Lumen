"use client"

import Image from "next/image"
import { useEffect, useState, type CSSProperties } from "react"

type NFTMediaProps = {
  imageUrl?: string
  videoUrl?: string
  alt: string
  imageStyle: CSSProperties
  placeholderStyle: CSSProperties
}

type MediaKind = "image" | "video" | "audio"
type MediaCandidate = { url: string; kind: MediaKind }

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".m4v"]
const AUDIO_EXTENSIONS = [".mp3", ".wav", ".m4a", ".aac", ".flac", ".oga"]

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
  color: "#5cff9d",
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
    return parsed.protocol === "https:" ? parsed.toString() : null
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

function buildCandidates(imageUrl?: string, videoUrl?: string): MediaCandidate[] {
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
}: NFTMediaProps) {
  const sourceKey = `${videoUrl ?? ""}|${imageUrl ?? ""}`
  const candidates = buildCandidates(imageUrl, videoUrl)
  const [candidateIndex, setCandidateIndex] = useState(0)

  useEffect(() => {
    setCandidateIndex(0)
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
        <span>Media unavailable</span>
      </div>
    )
  }

  const current = candidates[candidateIndex]
  const tryNextCandidate = () =>
    setCandidateIndex((currentIndex) => currentIndex + 1)

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
