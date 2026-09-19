"use client"

import type { CSSProperties } from "react"

type XShareButtonProps = {
  href?: string
  text?: string
  label?: string
  className?: string
  style?: CSSProperties
}

function absoluteUrl(href?: string) {
  if (typeof window === "undefined") return "https://viadeso.online/"
  if (!href) return window.location.href
  try {
    return new URL(href, window.location.origin).toString()
  } catch {
    return window.location.href
  }
}

export default function XShareButton({
  href,
  text = "Discover this on VIA",
  label = "X",
  className,
  style,
}: XShareButtonProps) {
  function shareOnX() {
    const url = absoluteUrl(href)
    const message = `${text}\n${url}`
    window.open(
      `https://x.com/intent/post?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    )
  }

  return (
    <button
      type="button"
      onClick={shareOnX}
      className={className}
      style={style}
      aria-label="Share on X"
      title="Share on X"
    >
      {label}
    </button>
  )
}
