import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Discover",
  description: "Discover DeSo creators, posts, media, NFT collections, culture, events and ideas across VIA.",
}

export default function DiscoverLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
