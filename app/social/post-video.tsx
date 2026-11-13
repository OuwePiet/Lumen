"use client"

import { useState } from "react"
import { postVideoEmbed } from "./video-source"

export default function PostVideo({ url }: { url: string }) {
  const [failed, setFailed] = useState(false)
  const embed = postVideoEmbed(url)
  return <div className="min-w-0">
    {embed ? <iframe src={embed} title="Post video" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="aspect-video w-full rounded-xl border-0" /> : failed ? <p role="status" className="rounded-lg border border-zinc-800 p-3 text-sm text-zinc-400">Deze video kan hier niet worden afgespeeld.</p> : <video src={url} controls preload="metadata" playsInline onError={() => setFailed(true)} className="max-h-[32rem] w-full rounded-xl" />}
    <a href={url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-[#9adbb2] underline">Open video</a>
  </div>
}
