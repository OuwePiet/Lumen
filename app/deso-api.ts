const DESO_NODE = "https://node.deso.org"
const REQUEST_TIMEOUT_MS = 12_000
const MAX_ATTEMPTS = 2

export async function fetchDeSo(
  endpoint: string,
  init: RequestInit
): Promise<Response> {
  let lastError: unknown

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch(
        `${DESO_NODE}/api/v0/${endpoint.replace(/^\//, "")}`,
        { ...init, signal: controller.signal }
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
