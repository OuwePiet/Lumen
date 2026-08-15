import type { CSSProperties } from "react"

export default function BackToCollection({
  href,
  style,
}: {
  href: string
  style?: CSSProperties
}) {
  return (
    <a href={href} style={style}>
      ← Back to collection
    </a>
  )
}
