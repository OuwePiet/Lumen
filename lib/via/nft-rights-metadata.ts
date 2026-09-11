import { normalizeRightsDeclaration, type ViaRightsDeclaration } from "./nft-rights"

const KIND_KEYS = ["VIA_LICENSE_KIND", "ViaLicenseKind", "LicenseKind"]
const STATEMENT_KEYS = ["VIA_LICENSE_STATEMENT", "ViaLicenseStatement", "LicenseStatement"]
const SOURCE_KEYS = ["VIA_LICENSE_SOURCE", "ViaLicenseSource", "LicenseSource"]
const VERIFIED_KEYS = ["VIA_LICENSE_CREATOR_DECLARED", "ViaLicenseCreatorDeclared"]

function firstString(data: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = data[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }
}

function creatorDeclared(data: Record<string, unknown>) {
  return VERIFIED_KEYS.some((key) => {
    const value = data[key]
    return value === true || value === "true" || value === "1"
  })
}

/**
 * Reads only explicitly named VIA/legacy-compatible license fields.
 * Presence of metadata never proves creator authorship; declaredByCreator is
 * only carried when the source data explicitly marks it and callers must still
 * establish that the metadata came from the NFT creator's post.
 */
export function readRightsMetadata(extraData: unknown): ViaRightsDeclaration {
  if (!extraData || typeof extraData !== "object") {
    return normalizeRightsDeclaration({})
  }

  const data = extraData as Record<string, unknown>
  return normalizeRightsDeclaration({
    kind: firstString(data, KIND_KEYS),
    statement: firstString(data, STATEMENT_KEYS),
    source: firstString(data, SOURCE_KEYS),
    declaredByCreator: creatorDeclared(data),
  })
}
