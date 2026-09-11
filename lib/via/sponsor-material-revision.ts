export type ViaSponsorMaterialRevision = {
  applicationId: string
  revision: number
  creativeFingerprint: string
  approvedRevision: number | null
}

export function createSponsorMaterialRevision(input: {
  applicationId: string
  creativeFingerprint: string
}): ViaSponsorMaterialRevision | null {
  if (!input.applicationId.trim() || !input.creativeFingerprint.trim()) return null

  return {
    applicationId: input.applicationId,
    revision: 1,
    creativeFingerprint: input.creativeFingerprint,
    approvedRevision: null,
  }
}

export function replaceSponsorMaterial(
  current: ViaSponsorMaterialRevision,
  creativeFingerprint: string,
): ViaSponsorMaterialRevision | null {
  const fingerprint = creativeFingerprint.trim()
  if (!fingerprint || fingerprint === current.creativeFingerprint) return null

  return {
    ...current,
    revision: current.revision + 1,
    creativeFingerprint: fingerprint,
    approvedRevision: null,
  }
}

export function approveSponsorMaterial(
  current: ViaSponsorMaterialRevision,
): ViaSponsorMaterialRevision {
  return {
    ...current,
    approvedRevision: current.revision,
  }
}

export function sponsorMaterialIsApproved(current: ViaSponsorMaterialRevision): boolean {
  return current.approvedRevision === current.revision
}

export const VIA_SPONSOR_MATERIAL_REVISION_RULES = {
  exactCreative:
    "Approval applies only to the exact submitted static advertisement revision.",
  changedMaterial:
    "Replacing the creative creates a new revision and immediately clears the previous approval.",
  reapproval:
    "A changed advertisement must pass review and receive owner approval again before placement.",
  noSilentSwap:
    "An advertiser cannot substitute different creative under an earlier approval.",
} as const
