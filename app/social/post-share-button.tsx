"use client"
import { Share2 } from "lucide-react"
export default function PostShareButton({ postHash }: { postHash: string }) {
  async function share() {
    const url = window.location.origin + "/social?post=" + encodeURIComponent(postHash)
    if (navigator.share) {
      try { await navigator.share({ title: "VIA", url }); return } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
      }
    }
    try { await navigator.clipboard.writeText(url) } catch { window.prompt("Copy link", url) }
  }
  return <button type="button" onClick={share} title="Share" aria-label="Share" className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-zinc-800 px-2 text-xs text-zinc-300"><Share2 aria-hidden="true" className="h-4 w-4" /></button>
}