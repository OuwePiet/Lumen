"use client"

import type { CSSProperties, MouseEvent } from "react"

export default function BackToCollection({
  href,
  style,
}: {
  href: string
  style?: CSSProperties
}) {
  const returnToCollection = (event: MouseEvent<HTMLAnchorElement>) => {
    try {
      const expected = new URL(href, window.location.origin)
      const previous = new URL(document.referrer)
      const expectedAccount = expected.searchParams.get("account")
      const previousAccount = previous.searchParams.get("account")

      if (
        expectedAccount &&
        previous.origin === window.location.origin &&
        previousAccount?.toLocaleLowerCase() ===
          expectedAccount.toLocaleLowerCase() &&
        window.history.length > 1
      ) {
        event.preventDefault()
        window.history.back()
      }
    } catch {
      // The deterministic href remains available as the safe fallback.
    }
  }

  return (
    <a href={href} style={style} onClick={returnToCollection}>
      ← Back to collection
    </a>
  )
}
