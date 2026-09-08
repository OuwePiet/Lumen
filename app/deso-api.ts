const DESO_NODE = "https://node.deso.org"
const REQUEST_TIMEOUT_MS = 12_000
const MAX_ATTEMPTS = 2

function normalizedEndpoint(endpoint: string) {
  return endpoint.replace(/^\//, "")
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
        `${DESO_NODE}/api/v0/${normalizedEndpoint(endpoint)}`,
        { ...requestInit, signal: controller.signal }
      )

      if (
        attempt + 1 < MAX_ATTEMPTS &&
        (response.status === 429 || response.status >= 500)
      ) {
        await response.body?.cancel()
        continue
      }

      return documentedResponse(endpoint, response)
    } catch (error) {
      lastError = error
      if (attempt + 1 >= MAX_ATTEMPTS) throw error
    } finally {
      clearTimeout(timeout)
    }
  }

  throw lastError ?? new Error("DeSo request failed")
}
