/**
 * WereldSpiegel news-source security boundary.
 *
 * Fail closed: no remote feeds are authorized until reviewed and explicitly
 * added to the allowlist. This module does not fetch anything by itself.
 */
export type ApprovedNewsSource = Readonly<{
  id: string
  hostname: string
  pathPrefix: string
}>

// Populate only after licensing, origin, and security review.
export const APPROVED_NEWS_SOURCES: readonly ApprovedNewsSource[] = []

export function validateNewsSourceUrl(
  rawUrl: string,
  approved: readonly ApprovedNewsSource[] = APPROVED_NEWS_SOURCES,
): URL | null {
  if (rawUrl.length > 2048 || /[\u0000-\u001f\u007f]/.test(rawUrl)) return null
  let url: URL
  try { url = new URL(rawUrl) } catch { return null }
  if (url.protocol !== "https:" || url.username || url.password || url.port || url.hash) return null
  const hostname = url.hostname.toLowerCase()
  // No IP literals, local hosts, or disguised DNS suffixes.
  if (hostname === "localhost" || hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") || hostname.endsWith(".internal") ||
      hostname.startsWith("[") || /^[0-9.]+$/.test(hostname)) return null
  if (!approved.some(source =>
    hostname === source.hostname.toLowerCase() &&
    url.pathname.startsWith(source.pathPrefix) &&
    (source.pathPrefix.endsWith("/") || url.pathname.length === source.pathPrefix.length ||
      url.pathname[source.pathPrefix.length] === "/")
  )) return null
  return url
}

/**
 * Network fetchers must additionally enforce: manual redirects (validate each
 * Location), DNS/private-address checks at connection time, timeout, body-size
 * cap, concurrency cap, MIME allowlist and shared caching. Do not pass an
 * untrusted URL to fetch() based only on this string-level validation.
 */
