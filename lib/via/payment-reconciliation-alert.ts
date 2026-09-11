export type ViaReconciliationAdminAlert = {
  visible: boolean
  severity: "none" | "attention"
  messageKey: "payment.reconciliation.none" | "payment.reconciliation.reviewNeeded"
}

export function reconciliationAdminAlert(openCases: number): ViaReconciliationAdminAlert | null {
  if (!Number.isSafeInteger(openCases) || openCases < 0) return null

  if (openCases === 0) {
    return {
      visible: false,
      severity: "none",
      messageKey: "payment.reconciliation.none",
    }
  }

  return {
    visible: true,
    severity: "attention",
    messageKey: "payment.reconciliation.reviewNeeded",
  }
}

export const VIA_RECONCILIATION_ADMIN_ALERT_RULES = {
  private:
    "The review-needed alert is rendered only inside the authenticated private VIA-owner/admin environment.",
  calm:
    "The alert is static and calm: no blinking, animation, aggressive interruption or public badge.",
  minimal:
    "The alert reveals only that review is needed; payer/payment details remain inside the protected case view.",
  noEffects:
    "Displaying or dismissing the alert does not change case state or trigger payment, refund, settlement, signing or blockchain writes.",
} as const
