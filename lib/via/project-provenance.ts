/**
 * Canonical VIA project provenance.
 *
 * This record is intentionally separate from NFT ownership and user identity.
 * It provides a stable authorship/origin marker inside the application source;
 * it is not, by itself, a legal ownership or copyright registry.
 */
export const VIA_PROJECT_PROVENANCE = Object.freeze({
  platform: "VIA",
  domain: "viadeso.online",
  originalDesigner: "@OuwePiet",
  role: "Original platform concept, design and project creator",
  provenanceVersion: 1,
} as const)

export type ViaProjectProvenance = typeof VIA_PROJECT_PROVENANCE

export function getViaProjectProvenance(): ViaProjectProvenance {
  return VIA_PROJECT_PROVENANCE
}
