"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import XShareButton from "./x-share-button"

export default function CopyNFTLink({
  style,
}: {
  style?: CSSProperties
}) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle")
  const copiedTimer = useRef<number | null>(null)

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
    let copied = false

    try {
      await navigator.clipboard.writeText(nftUrl)
      copied = true
    } catch {
      const temporaryInput = document.createElement("textarea")
      try {
        temporaryInput.value = nftUrl
        temporaryInput.style.position = "fixed"
        temporaryInput.style.opacity = "0"
        document.body.appendChild(temporaryInput)
        temporaryInput.select()
        copied = document.execCommand("copy")
      } catch {
        copied = false
      } finally {
        temporaryInput.remove()
      }
    }

    setCopyStatus(copied ? "copied" : "failed")
    if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current)
    copiedTimer.current = window.setTimeout(() => {
      copiedTimer.current = null
      setCopyStatus("idle")
    }, 2000)
  }

  useEffect(() => () => {
    if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current)
  }, [])

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
      <button type="button" style={buttonStyle} onClick={copyLink} aria-live="polite">
        {copyStatus === "copied" ? "NFT link copied" : copyStatus === "failed" ? "Copy unavailable" : "Copy link"}
      </button>
      <XShareButton text="View this NFT on VIA" label="X" style={buttonStyle} />
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
