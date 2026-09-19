import type { Metadata } from "next"
import MessagesClient from "./messages-client"

export const metadata: Metadata = {
  title: "VIA Messages",
  description: "Private DeSo conversations inside VIA.",
}

export default function MessagesPage() {
  return <MessagesClient />
}
