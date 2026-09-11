const DEFAULT_DESO_NODE = "https://node.deso.org"
const REQUEST_TIMEOUT_MS = 12_000
const MIN_ATTEMPTS = 2
const PROFILE_LOOKUP_CONCURRENCY = 6

let activeProfileLookups = 0
const profileLookupWaiters: Array<() => void> = []

function normalizedNodeUrl(value: string | undefined) {
  if (!value) return null

  try {
    const url = new URL(value.trim())
    if (url.protocol !== "https:") return null
    return url.origin
  } catch {
    return null
  }
}

const DESO_NODES = Array.from(
  new Set(
    [
      normalizedNodeUrl(process.env.NEXT_PUBLIC_DESO_NODE),
      normalizedNodeUrl(process.env.DESO_NODE),
      DEFAULT_DESO_NODE,
    ].filter((node): node is string => Boolean(node))
  )
)

function normalizedEndpoint(endpoint: string) {
  const normalized = endpoint.trim().replace(/^\/+/, "")
  if (!/^[a-z0-9-]+$/.test(normalized)) {
    throw new Error("INVALID_DESO_ENDPOINT")
  }
  return normalized
}

async function acquireProfileLookupSlot() {
  if (activeProfileLookups < PROFILE_LOOKUP_CONCURRENCY) {
    activeProfileLookups += 1
    return
  }

  await new Promise<void>((resolve) => profileLookupWaiters.push(resolve))
  activeProfileLookups += 1
}

function releaseProfileLookupSlot() {
  activeProfileLookups = Math.max(0, activeProfileLookups - 1)
  profileLookupWaiters.shift()?.()
}

function documentedRequest(endpoint: string, init: RequestInit): RequestInit {
  if (normalizedEndpoint(endpoint) !== "get-nfts-for-user" || typeof init.body !== "string") {
    return init
  }

  try {
    const body = JSON.parse(init.body) as Record<string, unknown>
    const safeBody: Record<string, unknown> = {
      UserPublicKeyBase58Check: body.UserPublicKeyBase58Check,
      ReaderPublicKeyBase58Check: body.ReaderPublicKeyBase58Check ?? "",
    }

    if (typeof body.IsForSale === "boolean") safeBody.IsForSale = body.IsForSale
    if (typeof body.IsPending === "boolean") safeBody.IsPending = body.IsPending

    return { ...init, body: JSON.stringify(safeBody) }
  } catch {
    return init
  }
}

async function documentedResponse(endpoint: string, response: Response): Promise<Response> {
  if (normalizedEndpoint(endpoint) !== "get-nfts-for-user" || !response.ok) {
    return response
  }

  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) return response

  try {
    const data = await response.clone().json() as Record<string, unknown>
    // VIA does not rely on undocumented transport cursor fields. Removing the
    // field here keeps legacy callers from accidentally looping over the same
    // documented request after LastKeyHex/Limit were stripped above.
    delete data.LastKeyHex

    const headers = new Headers(response.headers)
    headers.set("content-type", "application/json")
    headers.delete("content-length")

    return new Response(JSON.stringify(data), {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  } catch {
    return response
  }
}

async function performDeSoRequest(
  safeEndpoint: string,
  requestInit: RequestInit
): Promise<Response> {
  let lastError: unknown

  const maxAttempts = Math.max(MIN_ATTEMPTS, DESO_NODES.length)

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const node = DESO_NODES[attempt % DESO_NODES.length] ?? DEFAULT_DESO_NODE
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch(
        `${node}/api/v0/${safeEndpoint}`,
        {
          ...requestInit,
          signal: controller.signal,
          credentials: "omit",
          referrerPolicy: "no-referrer",
        }
      )

      if (
        attempt + 1 < maxAttempts &&
        (response.status === 429 || response.status >= 500)
      ) {
        await response.body?.cancel()
        continue
      }

      return documentedResponse(safeEndpoint, response)
    } catch (error) {
      lastError = error
      if (attempt + 1 >= maxAttempts) throw error
    } finally {
      clearTimeout(timeout)
    }
  }

  throw lastError ?? new Error("DeSo request failed")
}

export async function fetchDeSo(
  endpoint: string,
  init: RequestInit
): Promise<Response> {
  const safeEndpoint = normalizedEndpoint(endpoint)
  const requestInit = documentedRequest(safeEndpoint, init)

  if (safeEndpoint !== "get-single-profile") {
    return performDeSoRequest(safeEndpoint, requestInit)
  }

  await acquireProfileLookupSlot()
  try {
    return await performDeSoRequest(safeEndpoint, requestInit)
  } finally {
    releaseProfileLookupSlot()
  }
}
