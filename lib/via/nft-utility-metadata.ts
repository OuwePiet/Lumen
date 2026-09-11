import { normalizeNftUtilities, type ViaNftUtility } from "./nft-utility"

const UTILITY_KEYS = ["VIA_UTILITY", "ViaUtility"]

function parseJson(value: unknown): unknown {
  if (typeof value !== "string" || value.length > 16_384) return undefined
  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

/**
 * Reads only explicitly named VIA utility metadata. Metadata describes intended
 * utility; it never grants access by itself. Consumers must re-check current
 * ownership and authenticated identity where required.
 */
export function readUtilityMetadata(extraData: unknown): ViaNftUtility[] {
  if (!extraData || typeof extraData !== "object") return []
  const data = extraData as Record<string, unknown>

  for (const key of UTILITY_KEYS) {
    const raw = data[key]
    const parsed = Array.isArray(raw) ? raw : parseJson(raw)
    if (parsed !== undefined) return normalizeNftUtilities(parsed)
  }

  return []
}
