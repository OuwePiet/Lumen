export type ViaSafeEvidenceDisplay = {
  providerReference?: string
  transactionReference?: string
  amount?: string
  currency?: string
  observedAt?: string
}

export function safeEvidenceDisplay(input: ViaSafeEvidenceDisplay): ViaSafeEvidenceDisplay {
  const clean = (value?: string) => {
    const trimmed = value?.trim()
    return trimmed ? trimmed.slice(0, 160) : undefined
  }

  return {
    providerReference: clean(input.providerReference),
    transactionReference: clean(input.transactionReference),
    amount: clean(input.amount),
    currency: clean(input.currency),
    observedAt: clean(input.observedAt),
  }
}

export const VIA_SAFE_EVIDENCE_DISPLAY_RULES = {
  textOnly:
    "Evidence values are rendered as plain text; provider-supplied HTML, scripts, embeds and executable markup are never interpreted.",
  bounded:
    "Owner-facing evidence strings are length-bounded before display to reduce accidental oversized/untrusted payloads.",
  noLinks:
    "Provider/transaction references are identifiers by default, not automatically clickable external URLs.",
  redactedFirst:
    "The display model receives already-redacted evidence and is not a substitute for upstream secret exclusion/redaction.",
  noEffects:
    "Formatting evidence performs no case decision, payment confirmation, refund, settlement, signing or blockchain write.",
} as const
