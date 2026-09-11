export const VIA_LICENSE_KINDS = [
  "unspecified",
  "personal-use",
  "commercial-use",
  "custom",
] as const

export type ViaLicenseKind = (typeof VIA_LICENSE_KINDS)[number]

export type ViaRightsDeclaration = {
  kind: ViaLicenseKind
  statement?: string
  source?: string
  declaredByCreator: boolean
}

export function normalizeRightsDeclaration(input: {
  kind?: unknown
  statement?: unknown
  source?: unknown
  declaredByCreator?: unknown
}): ViaRightsDeclaration {
  const kind = VIA_LICENSE_KINDS.includes(input.kind as ViaLicenseKind)
    ? (input.kind as ViaLicenseKind)
    : "unspecified"

  return {
    kind,
    statement:
      typeof input.statement === "string" && input.statement.trim()
        ? input.statement.trim().slice(0, 2000)
        : undefined,
    source:
      typeof input.source === "string" && input.source.length <= 4096
        ? input.source
        : undefined,
    declaredByCreator: input.declaredByCreator === true,
  }
}

/**
 * A rights declaration records what the creator declared. VIA must not present
 * it as automatic statutory copyright transfer or legal advice.
 */
export function rightsDisplayLabel(rights: ViaRightsDeclaration) {
  if (!rights.declaredByCreator) return "No creator-verified rights declaration"
  if (rights.kind === "personal-use") return "Creator declaration · personal use"
  if (rights.kind === "commercial-use") return "Creator declaration · commercial use"
  if (rights.kind === "custom") return "Creator declaration · custom terms"
  return "Creator declaration · rights unspecified"
}
