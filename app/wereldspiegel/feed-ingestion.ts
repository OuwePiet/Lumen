import "server-only"
import { APPROVED_NEWS_SOURCES, validateNewsSourceUrl } from "./source-security"
import { deduplicateStories, validateStory, type VerifiedStory } from "./story-validation"

/**
 * Server-only ingestion boundary. Deliberately rejects all sources until the
 * source registry has been reviewed and populated. Never accepts user URLs.
 */
const TIMEOUT_MS = 5000
const MAX_BYTES = 256_000
const MAX_STORIES = 60
const MAX_REDIRECTS = 0

type FeedResult =
  | { ok: true; stories: VerifiedStory[]; rejected: number }
  | { ok: false; reason: "not-approved" | "network" | "http" | "content-type" | "too-large" | "invalid-feed" }

export async function ingestApprovedJsonFeed(sourceId: string): Promise<FeedResult> {
  const source = APPROVED_NEWS_SOURCES.find(s => s.id === sourceId)
  if (!source) return { ok: false, reason: "not-approved" }
  // This registry must hold an exact HTTPS endpoint, not a caller-supplied URL.
  const endpoint = source.pathPrefix
  const raw = "https://" + source.hostname + endpoint
  if (!validateNewsSourceUrl(raw)) return { ok: false, reason: "not-approved" }

  let response: Response
  try {
    response = await fetch(raw, {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
  } catch {
    return { ok: false, reason: "network" }
  }
  // Never follow redirects, including same-host redirects.
  if (response.status >= 300 && response.status < 400) return { ok: false, reason: "http" }
  if (!response.ok) return { ok: false, reason: "http" }
  const mime = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase()
  if (mime !== "application/json") return { ok: false, reason: "content-type" }
  const declaredLength = Number(response.headers.get("content-length") || 0)
  if (declaredLength > MAX_BYTES) return { ok: false, reason: "too-large" }
  if (!response.body) return { ok: false, reason: "invalid-feed" }

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      length += value.byteLength
      if (length > MAX_BYTES) {
        await reader.cancel()
        return { ok: false, reason: "too-large" }
      }
      chunks.push(value)
    }
  } catch {
    return { ok: false, reason: "network" }
  } finally {
    reader.releaseLock()
  }
  const bytes = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  let parsed: unknown
  try { parsed = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) }
  catch { return { ok: false, reason: "invalid-feed" } }
  if (!Array.isArray(parsed) || parsed.length > MAX_STORIES) return { ok: false, reason: "invalid-feed" }
  const accepted = parsed.map(item => validateStory(item)).filter((x): x is VerifiedStory => x !== null)
  return { ok: true, stories: deduplicateStories(accepted), rejected: parsed.length - accepted.length }
}

// Redirect policy is intentionally zero; do not raise without threat review.
void MAX_REDIRECTS
