export type ViaCommunitySupportCurrency = "USD" | "EUR" | "BTC"

export type ViaCommunitySupportIntent = {
  currency: ViaCommunitySupportCurrency
  amount: number
  anonymous: boolean
}

export function validateCommunitySupport(input: ViaCommunitySupportIntent) {
  if (!Number.isFinite(input.amount) || input.amount <= 0) return "invalid-amount" as const
  return "valid" as const
}

export type ViaSupportSignal = {
  kind: "via-pulse"
  durationSeconds: 8
  publicMessage: string
  revealSupporter: boolean
}

export function supportSignal(input: ViaCommunitySupportIntent): ViaSupportSignal {
  return {
    kind: "via-pulse",
    durationSeconds: 8,
    publicMessage: "VIA received community support · thank you",
    revealSupporter: !input.anonymous,
  }
}

export const VIA_COMMUNITY_SUPPORT_COPY = {
  en: {
    button: "Support VIA",
    intro: "Help VIA and its community with an amount of your choice.",
    amount: "Amount",
    currency: "Currency",
    anonymous: "Keep my support anonymous",
    signal: "Every confirmed contribution, however small, activates the VIA Pulse.",
  },
  nl: {
    button: "Steun VIA",
    intro: "Help VIA en de community met een bedrag naar keuze.",
    amount: "Bedrag",
    currency: "Valuta",
    anonymous: "Houd mijn bijdrage anoniem",
    signal: "Elke bevestigde bijdrage, hoe klein ook, activeert de VIA Pulse.",
  },
} as const

/**
 * VIA Pulse is deliberately subtle: a short non-flashing highlight around
 * the VIA mark/status area. It must respect reduced-motion preferences and
 * never blink, rotate or obstruct content.
 */
