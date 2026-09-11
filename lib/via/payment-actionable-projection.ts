import {
  paymentMethodAvailability,
  type ViaSupportedPaymentMethod,
} from "./payment-method-boundary-v2"
import { paymentAvailabilityConsistency } from "./payment-availability-consistency"

export function actionablePaymentMethods(input: {
  fiatOperational: boolean
  bitcoinOperational: boolean
  desoOperational: boolean
}): ViaSupportedPaymentMethod[] {
  return paymentMethodAvailability(input)
    .filter((item) => {
      const consistency = paymentAvailabilityConsistency(item)
      return consistency.valid && item.actionable
    })
    .map((item) => item.method)
}

export const VIA_ACTIONABLE_PAYMENT_PROJECTION_RULES = {
  singleSource:
    "Checkout derives actionable methods from the release+operational boundary and validates the actionability invariant instead of maintaining a second static enabled list.",
  failClosed:
    "Any inconsistent method state is omitted from the actionable projection.",
  order:
    "The projection preserves configured payment priority: fiat EUR/USD first, Bitcoin second and DESO only after an explicit future release.",
  noSecrets:
    "The projection returns payment method identifiers only and exposes no provider, wallet or security configuration.",
  noPayment:
    "Projection performs no signing, payment confirmation, refund, settlement, forwarding or blockchain write.",
} as const
