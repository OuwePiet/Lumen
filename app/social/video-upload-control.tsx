"use client"

import { useEffect, useState } from "react"
import { viaModernIdentity, type ViaModernIdentityUser } from "../deso-identity-modern"
import { uploadVideoToDeSo, waitForDeSoVideoReady } from "./deso-video-upload"

const MAX_VIDEO_BYTES = 250 * 1024 * 1024

type VideoUploadControlProps = {
  onReady?: (videoUrl: string) => void
  onBusyChange?: (busy: boolean) => void
}

type PendingVideo = {
  mediaId: string
  videoUrl: string
}

export default function VideoUploadControl({ onReady, onBusyChange }: VideoUploadControlProps) {
  const [session, setSession] = useState<ViaModernIdentityUser | null>(null)
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "pending" | "ready" | "error">("idle")
  const [message, setMessage] = useState("")
  const [progress, setProgress] = useState(0)
  const [videoUrl, setVideoUrl] = useState("")
  const [localPreviewUrl, setLocalPreviewUrl] = useState("")
  const [pendingVideo, setPendingVideo] = useState<PendingVideo | null>(null)

  useEffect(() => {
    void viaModernIdentity.currentUser().then(setSession)
    return viaModernIdentity.subscribe(setSession)
  }, [])

  useEffect(() => {
    onBusyChange?.(status === "uploading" || status === "processing")
    return () => onBusyChange?.(false)
  }, [status, onBusyChange])

  useEffect(() => () => { if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl) }, [localPreviewUrl])

  function clearVideo() {
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl)
    setLocalPreviewUrl("")
    setPendingVideo(null)
    setVideoUrl("")
    setProgress(0)
    setStatus("idle")
    setMessage("")
    onReady?.("")
  }

  function markReady(nextVideoUrl: string) {
    setPendingVideo(null)
    setVideoUrl(nextVideoUrl)
    onReady?.(nextVideoUrl)
    setStatus("ready")
    setMessage(onReady
      ? "Video is ready and attached to this post draft. Uploading alone did not publish anything."
      : "Video is ready. Uploading alone did not publish anything.")
  }

  async function recheckPendingVideo() {
    if (!pendingVideo || status === "processing") return

    setStatus("processing")
    setMessage("Checking the DeSo video stream again…")
    try {
      const ready = await waitForDeSoVideoReady(pendingVideo.mediaId, 30, 2000)
      if (ready) {
        markReady(pendingVideo.videoUrl)
        return
      }

      setStatus("pending")
      setMessage("The upload is safe, but DeSo is still processing this video. You can keep editing the draft and check again.")
    } catch {
      setStatus("pending")
      setMessage("The upload is safe, but VIA could not confirm that DeSo finished processing it yet. You can check again.")
    }
  }

  async function upload(file: File | null) {
    if (!session || !file || status === "uploading" || status === "processing") return

    if (!file.type.startsWith("video/")) {
      setStatus("error")
      setMessage("Choose a video file.")
      return
    }
    if (file.size <= 0 || file.size > MAX_VIDEO_BYTES) {
      setStatus("error")
      setMessage("Video must be smaller than 250 MB.")
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setLocalPreviewUrl((current) => { if (current) URL.revokeObjectURL(current); return previewUrl })

    try {
      setPendingVideo(null)
      setVideoUrl("")
      setProgress(0)
      setStatus("uploading")
      setMessage("Uploading directly to the DeSo video service…")
      const result = await uploadVideoToDeSo(file, ({ percent }) => setProgress(percent))

      setPendingVideo(result)
      setStatus("processing")
      setMessage("Upload complete. Waiting for the DeSo video stream to become ready…")
      const ready = await waitForDeSoVideoReady(result.mediaId)
      if (!ready) {
        setStatus("pending")
        setMessage("Upload complete. DeSo is still processing the video. Nothing failed or published; you can keep editing the draft and check again.")
        return
      }

      markReady(result.videoUrl)
    } catch {
      setPendingVideo(null)
      setStatus("error")
      setMessage("The video upload could not be completed. Nothing was published.")
    }
  }

  if (!session) return null

  return (
    <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
      <p className="hidden text-sm font-medium text-zinc-200 sm:block">Video upload</p>
      <p className="mt-1 text-xs leading-5 text-zinc-500">One video at a time · maximum 250 MB.</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center rounded-lg border border-[#285f40] px-3 py-2 text-xs font-semibold text-[#9adbb2]">
          {status === "uploading" ? `Uploading ${progress}%…` : status === "processing" ? "Processing on DeSo…" : "Choose video for DeSo upload"}
          <input
            type="file"
            accept="video/*"
            className="sr-only"
            disabled={status === "uploading" || status === "processing"}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null
              event.currentTarget.value = ""
              void upload(file)
            }}
          />
        </label>

        {status === "pending" && pendingVideo ? (
          <button
            type="button"
            onClick={() => void recheckPendingVideo()}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 hover:border-[#8fd4a9]/55 hover:text-[#9adbb2]"
          >
            Check processing again
          </button>
        ) : null}
      </div>

      {localPreviewUrl ? <div className="mt-3"><video src={localPreviewUrl} controls preload="metadata" className="max-h-56 w-full rounded-lg border border-zinc-800 bg-black" /><button type="button" onClick={clearVideo} disabled={status === "uploading" || status === "processing"} className="mt-2 text-xs text-zinc-500 hover:text-zinc-300 disabled:opacity-40">Verwijderen</button></div> : null}
      {message ? <p className={`mt-2 text-xs ${status === "error" ? "text-amber-300" : status === "pending" ? "text-amber-200" : "text-zinc-400"}`}>{message}</p> : null}
      {videoUrl ? <input readOnly value={videoUrl} aria-label="Ready DeSo video URL" className="mt-3 w-full rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-xs text-zinc-300" /> : null}
    </div>
  )
}
