const TUS_VERSION = "1.0.0"
const CHUNK_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_BYTES = 250 * 1024 * 1024

export type VideoUploadProgress = {
  uploadedBytes: number
  totalBytes: number
  percent: number
}

type TokenResponse = { ok?: boolean; uploadUrl?: string; mediaId?: string; error?: string }
type StatusResponse = { ok?: boolean; ready?: boolean; error?: string }

function validHttpsUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "https:" && !url.username && !url.password ? url.toString() : null
  } catch {
    return null
  }
}

export async function uploadVideoToDeSo(
  file: File,
  onProgress?: (progress: VideoUploadProgress) => void
) {
  if (file.size <= 0 || file.size > MAX_VIDEO_BYTES) throw new Error("INVALID_VIDEO_SIZE")
  if (!file.type.startsWith("video/")) throw new Error("INVALID_VIDEO_TYPE")

  const tokenResponse = await fetch("/api/via/social/video-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ action: "token", fileSize: file.size }),
  })
  const token = await tokenResponse.json() as TokenResponse
  if (!tokenResponse.ok || !token.ok || !token.uploadUrl || !token.mediaId) {
    throw new Error(token.error || "VIDEO_TOKEN_FAILED")
  }

  const uploadUrl = validHttpsUrl(token.uploadUrl)
  if (!uploadUrl) throw new Error("INVALID_VIDEO_UPLOAD_URL")

  let offset = 0
  while (offset < file.size) {
    const end = Math.min(offset + CHUNK_BYTES, file.size)
    const chunk = file.slice(offset, end)
    const response = await fetch(uploadUrl, {
      method: "PATCH",
      headers: {
        "Tus-Resumable": TUS_VERSION,
        "Upload-Offset": String(offset),
        "Content-Type": "application/offset+octet-stream",
      },
      body: chunk,
    })
    if (!response.ok) throw new Error("VIDEO_UPLOAD_FAILED")

    const nextOffset = Number(response.headers.get("upload-offset"))
    offset = Number.isFinite(nextOffset) && nextOffset > offset ? nextOffset : end
    onProgress?.({
      uploadedBytes: offset,
      totalBytes: file.size,
      percent: Math.min(100, Math.round((offset / file.size) * 100)),
    })
  }

  return {
    mediaId: token.mediaId,
    videoUrl: `https://iframe.videodelivery.net/${token.mediaId}`,
  }
}

export async function waitForDeSoVideoReady(mediaId: string, attempts = 90, delayMs = 2000) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const response = await fetch("/api/via/social/video-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ action: "status", mediaId }),
    })
    const data = await response.json() as StatusResponse
    if (response.ok && data.ok && data.ready) return true
    if (attempt + 1 < attempts) await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
  return false
}
