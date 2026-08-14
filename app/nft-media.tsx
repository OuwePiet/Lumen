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

  return [
    `https://ipfs.io/ipfs/${ipfsPath}`,
    `https://dweb.link/ipfs/${ipfsPath}`,
  ]
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
    return <div style={placeholderStyle}>No media available</div>
  }

  if (candidateIndex >= candidates.length) {
    return <div style={placeholderStyle}>Media unavailable</div>
  }

  const currentUrl = candidates[candidateIndex]
  const tryNextCandidate = () =>
    setCandidateIndex((current) => current + 1)

  if (kind === "video") {
    return (
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
    )
  }

  if (kind === "audio") {
    return (
      <div style={placeholderStyle}>
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
  )
}
