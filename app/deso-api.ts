const DESO_NODE = "https://node.deso.org"
const REQUEST_TIMEOUT_MS = 12_000
const MAX_ATTEMPTS = 2

function documentedRequest(endpoint: string, init: RequestInit): RequestInit {
  if (endpoint.replace(/^\//, "") !== "get-nfts-for-user" || typeof init.body !== "string") {
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

export async function fetchDeSo(
  endpoint: string,
  init: RequestInit
): Promise<Response> {
  let lastError: unknown
  const requestInit = documentedRequest(endpoint, init)

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch(
        `${DESO_NODE}/api/v0/${endpoint.replace(/^\//, "")}`,
        { ...requestInit, signal: controller.signal }
      )

      if (
        attempt + 1 < MAX_ATTEMPTS &&
        (response.status === 429 || response.status >= 500)
      ) {
        await response.body?.cancel()
        continue
      }

      return response
    } catch (error) {
      lastError = error
      if (attempt + 1 >= MAX_ATTEMPTS) throw error
    } finally {
      clearTimeout(timeout)
    }
  }

  throw lastError ?? new Error("DeSo request failed")
}
