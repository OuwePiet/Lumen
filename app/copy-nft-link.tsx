"use client"

import { useState, type CSSProperties } from "react"

export default function CopyNFTLink({
  style,
}: {
  style?: CSSProperties
}) {
  const [copied, setCopied] = useState(false)

  const buttonStyle: CSSProperties = {
    ...style,
    background: "transparent",
    border: "1px solid rgba(143, 212, 169, .42)",
    borderRadius: "11px",
    color: "#9adbb2",
    minHeight: "40px",
    padding: "8px 13px",
  }

  const currentNFTUrl = () => `${window.location.origin}${window.location.pathname}`

  const copyLink = async () => {
    const nftUrl = currentNFTUrl()

    try {
      await navigator.clipboard.writeText(nftUrl)
    } catch {
      const temporaryInput = document.createElement("textarea")
      temporaryInput.value = nftUrl
      temporaryInput.style.position = "fixed"
      temporaryInput.style.opacity = "0"
      document.body.appendChild(temporaryInput)
      temporaryInput.select()
      document.execCommand("copy")
      temporaryInput.remove()
    }

    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const shareWhatsApp = () => {
    const text = `View this NFT on VIA: ${currentNFTUrl()}`
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  return (
    <div
      role="group"
      aria-label="Share NFT"
      style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
    >
      <button type="button" style={buttonStyle} onClick={copyLink}>
        {copied ? "NFT link copied" : "Copy link"}
      </button>
      <button
        type="button"
        style={buttonStyle}
        onClick={shareWhatsApp}
        aria-label="Share NFT via WhatsApp"
      >
        WhatsApp
      </button>
    </div>
  )
}
