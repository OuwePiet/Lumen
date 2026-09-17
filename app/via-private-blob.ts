const BLOB_API = "https://vercel.com/api/blob"
const BLOB_API_VERSION = "12"

type BlobAuth = { token: string; storeId: string }

type BlobListItem = {
  url?: string
  pathname?: string
  uploadedAt?: string
}

type BlobListResponse = {
  blobs?: BlobListItem[]
  hasMore?: boolean
  cursor?: string
}

function readEnv(name: string) {
  const value = process.env[name]
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function normalizeStoreId(value: string) {
  return value.startsWith("store_") ? value.slice(6) : value
}

function resolveBlobAuth(): BlobAuth | null {
  const readWrite = readEnv("BLOB_READ_WRITE_TOKEN")
  if (readWrite) {
    const parts = readWrite.split("_")
    const storeId = parts[3] || ""
    if (storeId) return { token: readWrite, storeId }
  }

  const oidc = readEnv("VERCEL_OIDC_TOKEN")
  const store = readEnv("BLOB_STORE_ID")
  if (oidc && store) return { token: oidc, storeId: normalizeStoreId(store) }

  return null
}

export function isViaIdeasStorageConfigured() {
  return Boolean(resolveBlobAuth())
}

function apiHeaders(auth: BlobAuth, extra?: Record<string, string>) {
  return {
    authorization: `Bearer ${auth.token}`,
    "x-vercel-blob-store-id": auth.storeId,
    "x-api-version": BLOB_API_VERSION,
    "x-api-blob-request-id": `${auth.storeId}:${Date.now()}:${Math.random().toString(16).slice(2)}`,
    "x-api-blob-request-attempt": "0",
    ...extra,
  }
}

export async function putPrivateJson(pathname: string, value: unknown) {
  const auth = resolveBlobAuth()
  if (!auth) return { ok: false as const, reason: "STORAGE_NOT_CONFIGURED" as const }

  const response = await fetch(`${BLOB_API}/?pathname=${encodeURIComponent(pathname)}`, {
    method: "PUT",
    headers: apiHeaders(auth, {
      "content-type": "application/json; charset=utf-8",
      "x-content-type": "application/json; charset=utf-8",
      "x-vercel-blob-access": "private",
      "x-add-random-suffix": "0",
      "x-allow-overwrite": "0",
    }),
    body: JSON.stringify(value),
    cache: "no-store",
  })

  if (response.status === 409 || response.status === 412) {
    return { ok: false as const, reason: "RATE_LIMITED" as const }
  }
  if (!response.ok) return { ok: false as const, reason: "STORAGE_WRITE_FAILED" as const }
  return { ok: true as const }
}

export async function listPrivateJson(prefix: string, limit = 100) {
  const auth = resolveBlobAuth()
  if (!auth) return { ok: false as const, reason: "STORAGE_NOT_CONFIGURED" as const, items: [] as unknown[] }

  const params = new URLSearchParams({ prefix, limit: String(limit) })
  const response = await fetch(`${BLOB_API}/?${params.toString()}`, {
    method: "GET",
    headers: apiHeaders(auth),
    cache: "no-store",
  })
  if (!response.ok) return { ok: false as const, reason: "STORAGE_LIST_FAILED" as const, items: [] as unknown[] }

  const data = await response.json() as BlobListResponse
  const blobs = Array.isArray(data.blobs) ? data.blobs : []
  const items: unknown[] = []

  for (const blob of blobs) {
    if (!blob.url) continue
    try {
      const itemResponse = await fetch(blob.url, {
        headers: {
          authorization: `Bearer ${auth.token}`,
          "x-vercel-blob-store-id": auth.storeId,
        },
        cache: "no-store",
      })
      if (!itemResponse.ok) continue
      items.push(await itemResponse.json())
    } catch {
      // Skip a malformed or temporarily unreadable item rather than failing the inbox.
    }
  }

  return { ok: true as const, items }
}
