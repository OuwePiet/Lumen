"use client"

import { useEffect, useState } from "react"
import { restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"
import { uploadVideoToDeSo, waitForDeSoVideoReady } from "./deso-video-upload"

const MAX_VIDEO_BYTES = 250 * 1024 * 1024

type VideoUploadControlProps = {
  onReady?: (videoUrl: string) => void
  onBusyChange?: (busy: boolean) => void
}

export default function VideoUploadControl({ onReady, onBusyChange }: VideoUploadControlProps) {
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "ready" | "error">("idle")
  const [message, setMessage] = useState("")
  const [progress, setProgress] = useState(0)
  const [videoUrl, setVideoUrl] = useState("")

  useEffect(() => {
    setSession(restoreIdentitySession())
    const onSession = (event: Event) => setSession((event as CustomEvent<ViaIdentitySession | null>).detail ?? restoreIdentitySession())
    window.addEventListener(VIA_IDENTITY_EVENT, onSession)
    return () => window.removeEventListener(VIA_IDENTITY_EVENT, onSession)
  }, [])

  useEffect(() => {
    onBusyChange?.(status === "uploading" || status === "processing")
    return () => onBusyChange?.(false)
  }, [status, onBusyChange])

  async function upload(file: File | null) {
    if (!session || !file || status === "uploading" || status === "processing") return

    if (!file.type.startsWith("video/")) {
      setStatus("error")
      setMessage("Choose a video file.")
      return
    }
    if (file.size <= 0 || file.size > MAX_VIDEO_BYTES) {
      setStatus("error")
      setMessage("Video must be 250 MB or smaller.")
      return
    }

    try {
      setVideoUrl("")
      setProgress(0)
      setStatus("uploading")
      setMessage("Uploading directly to the DeSo video service…")
      const result = await uploadVideoToDeSo(file, ({ percent }) => setProgress(percent))

      setStatus("processing")
      setMessage("Upload complete. Waiting for the DeSo video stream to become ready…")
      const ready = await waitForDeSoVideoReady(result.mediaId)
      if (!ready) throw new Error("VIDEO_NOT_READY")

      setVideoUrl(result.videoUrl)
      onReady?.(result.videoUrl)
      setStatus("ready")
      setMessage(onReady
        ? "Video is ready and attached to this post draft. Uploading alone did not publish anything."
        : "Video is ready. Uploading alone did not publish anything.")
    } catch {
      setStatus("error")
      setMessage("The video could not be prepared for posting. Nothing was published.")
    }
  }

  if (!session) return null

  return (
    <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
      <p className="text-sm font-medium text-zinc-200">Direct DeSo video upload</p>
      <p className="mt-1 text-xs leading-5 text-zinc-500">One video at a time · up to 250 MB · uploaded through DeSo&apos;s tokenized tus route. VIA keeps no permanent video copy.</p>

      <label className="mt-3 inline-flex cursor-pointer items-center rounded-lg border border-green-800 px-3 py-2 text-xs font-semibold text-green-300">
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

      {message ? <p className={`mt-2 text-xs ${status === "error" ? "text-amber-300" : "text-zinc-400"}`}>{message}</p> : null}
      {videoUrl ? <input readOnly value={videoUrl} aria-label="Ready DeSo video URL" className="mt-3 w-full rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-xs text-zinc-300" /> : null}
    </div>
  )
}
