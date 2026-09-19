export const VIA_SENSITIVE_CONTENT_KEY = "ViaSensitiveContent"

export function isViaSensitiveContent(extraData: unknown) {
  if (!extraData || typeof extraData !== "object" || Array.isArray(extraData)) return false
  const value = (extraData as Record<string, unknown>)[VIA_SENSITIVE_CONTENT_KEY]
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    return normalized === "1" || normalized === "true" || normalized === "yes"
  }
  if (typeof value === "number") return value === 1
  if (typeof value === "boolean") return value
  return false
}
