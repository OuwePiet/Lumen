export const VIA_MINT_PROVENANCE_VERSION = 1 as const

export type ViaMintProvenance = {
  platform: "VIA"
  version: typeof VIA_MINT_PROVENANCE_VERSION
  origin: "viadeso.online"
}

export const VIA_MINT_PROVENANCE: ViaMintProvenance = {
  platform: "VIA",
  version: VIA_MINT_PROVENANCE_VERSION,
  origin: "viadeso.online",
}

/**
 * Metadata keys are namespaced so other DeSo frontends can ignore them safely
 * while VIA can recognize NFTs intentionally minted through VIA.
 */
export function viaMintProvenanceExtraData() {
  return {
    VIA_MINT_PLATFORM: VIA_MINT_PROVENANCE.platform,
    VIA_MINT_VERSION: String(VIA_MINT_PROVENANCE.version),
    VIA_MINT_ORIGIN: VIA_MINT_PROVENANCE.origin,
  }
}

export function readViaMintProvenance(extraData: unknown): ViaMintProvenance | null {
  if (!extraData || typeof extraData !== "object") return null
  const data = extraData as Record<string, unknown>

  return data.VIA_MINT_PLATFORM === "VIA" &&
    data.VIA_MINT_VERSION === String(VIA_MINT_PROVENANCE_VERSION) &&
    data.VIA_MINT_ORIGIN === "viadeso.online"
    ? VIA_MINT_PROVENANCE
    : null
}
