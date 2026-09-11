import type { ViaSponsorLifecycleStatus } from "./sponsor-lifecycle"

export const VIA_SPONSOR_STATUS_COPY: Record<
  "en" | "nl",
  Record<ViaSponsorLifecycleStatus, string>
> = {
  en: {
    submitted: "Application received",
    "under-review": "Under review",
    rejected: "Not approved",
    "approved-awaiting-payment": "Approved · awaiting payment",
    scheduled: "Paid · scheduled",
    "active-first-half": "Active · first period",
    "awaiting-second-payment": "Paused · second payment required",
    "active-second-half": "Active",
    expired: "Ended",
  },
  nl: {
    submitted: "Aanvraag ontvangen",
    "under-review": "Wordt beoordeeld",
    rejected: "Niet goedgekeurd",
    "approved-awaiting-payment": "Goedgekeurd · wacht op betaling",
    scheduled: "Betaald · ingepland",
    "active-first-half": "Actief · eerste periode",
    "awaiting-second-payment": "Gepauzeerd · tweede betaling nodig",
    "active-second-half": "Actief",
    expired: "Afgelopen",
  },
}

export function sponsorStatusLabel(
  status: ViaSponsorLifecycleStatus,
  locale: "en" | "nl" = "nl"
) {
  return VIA_SPONSOR_STATUS_COPY[locale][status]
}

export const VIA_SPONSOR_APPLICANT_GUIDE = {
  privacy:
    "An applicant can see only the status of their own application; private VIA review notes and other sponsor applications are never exposed.",
  plainLanguage:
    "Applicant status messages use plain language and do not expose internal workflow or security details.",
} as const
