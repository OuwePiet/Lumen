"use client"

import Image from "next/image"
import { useState, type CSSProperties } from "react"

type NFTMediaProps = {
  url?: string
  alt: string
  imageStyle: CSSProperties
  placeholderStyle: CSSProperties
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
  url,
  alt,
  imageStyle,
  placeholderStyle,
}: NFTMediaProps) {
  const candidates = mediaCandidates(url)
  const [candidateIndex, setCandidateIndex] = useState(0)

  if (candidates.length === 0) {
    return <div style={placeholderStyle}>No image available</div>
  }

  if (candidateIndex >= candidates.length) {
    return <div style={placeholderStyle}>Image unavailable</div>
  }

  return (
    <Image
      key={candidates[candidateIndex]}
      src={candidates[candidateIndex]}
      alt={alt}
      width={600}
      height={600}
      sizes="(max-width: 600px) 100vw, 600px"
      loader={passthroughLoader}
      unoptimized
      style={imageStyle}
      onError={() => setCandidateIndex((current) => current + 1)}
    />
  )
}
