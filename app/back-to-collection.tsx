import type { CSSProperties } from "react"

function safeCollectionHref(href: string) {
  const [pathAndQuery, hash = ""] = href.split("#", 2)
  const [path, query = ""] = pathAndQuery.split("?", 2)
  const params = new URLSearchParams(query)

  // accountKey remains accepted for old inbound VIA links, but VIA should not
  // keep publishing it when navigating back to a public collection.
  params.delete("accountKey")

  const nextQuery = params.toString()
  return `${path}${nextQuery ? `?${nextQuery}` : ""}${hash ? `#${hash}` : ""}`
}

export default function BackToCollection({
  href,
  style,
}: {
  href: string
  style?: CSSProperties
}) {
  return (
    <a href={safeCollectionHref(href)} style={style}>
      ← Back to collection
    </a>
  )
}
