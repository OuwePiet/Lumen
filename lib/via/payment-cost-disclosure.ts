export type ViaPaymentCostQuote = {
  amountMinor: number
  processingCostMinor: number
  totalMinor: number
  processingCostChargedToCustomer: boolean
}

export function buildPaymentCostQuote(input: {
  amountMinor: number
  processingCostMinor: number
  customerCostAllowed: boolean
}): ViaPaymentCostQuote | null {
  if (!Number.isSafeInteger(input.amountMinor) || input.amountMinor < 1) return null
  if (!Number.isSafeInteger(input.processingCostMinor) || input.processingCostMinor < 0) return null

  const customerCost = input.customerCostAllowed ? input.processingCostMinor : 0
  const totalMinor = input.amountMinor + customerCost

  if (!Number.isSafeInteger(totalMinor)) return null

  return {
    amountMinor: input.amountMinor,
    processingCostMinor: customerCost,
    totalMinor,
    processingCostChargedToCustomer: input.customerCostAllowed && customerCost > 0,
  }
}

export function paymentCostDisplay(quote: ViaPaymentCostQuote) {
  return {
    amountMinor: quote.amountMinor,
    costsMinor: quote.processingCostMinor,
    totalMinor: quote.totalMinor,
  }
}

export const VIA_PAYMENT_COST_RULES = {
  disclosure:
    "Before payment confirmation, VIA shows the contribution or sponsor amount, any customer-paid processing cost, and the resulting total separately.",
  legalBoundary:
    "Processing cost is charged to the customer only where applicable law and the selected provider permit it.",
  providerBoundary:
    "The payment provider remains responsible for its own final fee calculation and regulated payment handling.",
  noHiddenMarkup:
    "VIA must not silently add an undisclosed payment-processing amount to the displayed total.",
} as const
