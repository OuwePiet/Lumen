"use client"

import type { CSSProperties } from "react"

export default function ShareNFTWhatsApp({
  style,
}: {
  style?: CSSProperties
}) {
  const share = () => {
    const nftUrl = `${window.location.origin}${window.location.pathname}`
    const text = `View this NFT on VIA: ${nftUrl}`
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`

    window.open(shareUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <button type="button" style={style} onClick={share} aria-label="Share NFT via WhatsApp">
      WhatsApp
    </button>
  )
}
