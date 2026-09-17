import type { Metadata } from "next"
import QuestPageClient from "./quest-page-client"

export const metadata: Metadata = {
  title: "VIA World Quest",
  description: "Play the world, discover DeSo creators, NFTs and VIA experiences.",
}

export default function QuestPage() {
  return <QuestPageClient />
}
