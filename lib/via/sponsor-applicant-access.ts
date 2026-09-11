export type ViaSponsorApplicantIdentity = {
  applicantId: string
}

export type ViaSponsorApplicationAccessRecord = {
  applicationId: string
  applicantId: string
}

export type ViaSponsorApplicantAccessResult = {
  allowed: boolean
  reason: "owner-match" | "not-owner" | "missing-identity"
}

export function sponsorApplicantMayView(input: {
  viewer?: ViaSponsorApplicantIdentity
  application: ViaSponsorApplicationAccessRecord
}): ViaSponsorApplicantAccessResult {
  const viewerId = input.viewer?.applicantId.trim()
  const ownerId = input.application.applicantId.trim()

  if (!viewerId || !ownerId) {
    return { allowed: false, reason: "missing-identity" }
  }

  if (viewerId !== ownerId) {
    return { allowed: false, reason: "not-owner" }
  }

  return { allowed: true, reason: "owner-match" }
}

export type ViaSponsorApplicantPublicView = {
  applicationId: string
  status: string
}

export function buildSponsorApplicantPublicView(input: {
  access: ViaSponsorApplicantAccessResult
  applicationId: string
  status: string
}): ViaSponsorApplicantPublicView | null {
  if (!input.access.allowed) return null

  return {
    applicationId: input.applicationId,
    status: input.status,
  }
}

export const VIA_SPONSOR_APPLICANT_ACCESS_RULES = {
  ownOnly:
    "A sponsor applicant may read only an application bound to the same authenticated applicant identity.",
  noInternalNotes:
    "The public applicant view contains status only and must never include internal review notes, admin decisions, payment references or security metadata.",
  noCrossApplicantAccess:
    "Knowing another application ID is insufficient to view it; identity ownership must also match.",
  ownerAdminSeparate:
    "VIA owner/admin access remains a separate private authorization path and is not granted through applicant access.",
} as const
