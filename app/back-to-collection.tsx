"use client"

import type { MouseEvent } from "react"

export default function BackToCollection({
  href,
  style,
}: {
  href: string
  style?: React.CSSProperties
}) {
  const goBack = (event: MouseEvent<HTMLAnchorElement>) => {
    try {
      const referrer = document.referrer
      const cameFromLumen =
        Boolean(referrer) &&
        new URL(referrer).origin === window.location.origin

      if (cameFromLumen && window.history.length > 1) {
        event.preventDefault()
        window.history.back()
      }
    } catch {
      // The href remains the safe fallback.
    }
  }

  return (
    <a href={href} style={style} onClick={goBack}>
      ← Back to collection
    </a>
  )
}
