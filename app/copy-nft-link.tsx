"use client"

import { useState, type CSSProperties } from "react"

export default function CopyNFTLink({
  style,
}: {
  style?: CSSProperties
}) {
  const [copied, setCopied] = useState(false)

  const copyLink = async () => {
    const nftUrl = `${window.location.origin}${window.location.pathname}`

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

  return (
    <button type="button" style={style} onClick={copyLink}>
      {copied ? "NFT link copied" : "Copy NFT link"}
    </button>
  )
}
