"use client"

import Image from "next/image"
import { useState, type CSSProperties } from "react"

type NFTMediaProps = {
  imageUrl?: string
  videoUrl?: string
  alt: string
  imageStyle: CSSProperties
  placeholderStyle: CSSProperties
}

type MediaKind = "image" | "video" | "audio"

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

function mediaCandidates(url?: string) {
  if (!url) return []

  const ipfsPrefix = "ipfs://"
  const ipfsMarker = "/ipfs/"
  const ipfsPath = url.startsWith(ipfsPrefix)
    ? url.slice(ipfsPrefix.length)
    : url.includes(ipfsMarker)
      ? url.slice(url.indexOf(ipfsMarker) + ipfsMarker.length)
      : null

  if (!ipfsPath) return [url]

  return Array.from(
    new Set([
      url,
      `https://ipfs.io/ipfs/${ipfsPath}`,
      `https://dweb.link/ipfs/${ipfsPath}`,
    ])
  )
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
  const sourceUrl = videoUrl ?? imageUrl
  const kind = sourceUrl ? mediaKind(sourceUrl, Boolean(videoUrl)) : null
  const candidates = mediaCandidates(sourceUrl)
  const [candidateIndex, setCandidateIndex] = useState(0)

  if (!kind || candidates.length === 0) {
    return (
      <div style={{ ...placeholderStyle, position: "relative" }}>
        <MediaBadge label="Media unavailable" />
        <span>No media available</span>
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

  const currentUrl = candidates[candidateIndex]
  const tryNextCandidate = () =>
    setCandidateIndex((current) => current + 1)

  if (kind === "video") {
    return (
      <div style={mediaWrapperStyle}>
        <MediaBadge label="Video" />
        <video
          key={currentUrl}
          src={currentUrl}
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

  if (kind === "audio") {
    return (
      <div style={{ ...placeholderStyle, position: "relative" }}>
        <MediaBadge label="Audio" />
        <audio
          key={currentUrl}
          src={currentUrl}
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
        key={currentUrl}
        src={currentUrl}
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
