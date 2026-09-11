export const VIA_UTILITY_KINDS = [
  "access",
  "ticket",
  "download",
  "community",
  "external-app",
  "custom",
] as const

export type ViaUtilityKind = (typeof VIA_UTILITY_KINDS)[number]

export type ViaNftUtility = {
  kind: ViaUtilityKind
  label: string
  target?: string
  requiresCurrentOwnership: boolean
}

export function normalizeNftUtilities(input: unknown): ViaNftUtility[] {
  if (!Array.isArray(input)) return []

  return input.slice(0, 32).flatMap((item) => {
    if (!item || typeof item !== "object") return []
    const value = item as Record<string, unknown>
    if (!VIA_UTILITY_KINDS.includes(value.kind as ViaUtilityKind)) return []
    if (typeof value.label !== "string" || !value.label.trim()) return []

    const target =
      typeof value.target === "string" &&
      value.target.length <= 4096 &&
      (/^https:\/\//i.test(value.target) || value.target.startsWith("via:"))
        ? value.target
        : undefined

    return [{
      kind: value.kind as ViaUtilityKind,
      label: value.label.trim().slice(0, 160),
      target,
      requiresCurrentOwnership: value.requiresCurrentOwnership !== false,
    }]
  })
}

/**
 * Utility metadata describes intended use. Access must still re-check current
 * DeSo ownership and, for private actions, control of the logged-in identity.
 */
export function utilityNeedsVerifiedIdentity(utility: ViaNftUtility) {
  return utility.requiresCurrentOwnership
}
