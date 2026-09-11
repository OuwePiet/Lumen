import type { ViaBitcoinOperationalGate } from "./bitcoin-operational-gate"

export type ViaBitcoinPublicAvailability = {
  offered: boolean
  statusKey:
    | "payment.bitcoin.available"
    | "payment.bitcoin.unavailable"
}

export function bitcoinPublicAvailability(
  gate: ViaBitcoinOperationalGate,
): ViaBitcoinPublicAvailability {
  return gate.ready
    ? { offered: true, statusKey: "payment.bitcoin.available" }
    : { offered: false, statusKey: "payment.bitcoin.unavailable" }
}

export const VIA_BITCOIN_PUBLIC_AVAILABILITY_RULES = {
  gateOnly:
    "Public Bitcoin availability is derived only from the full operational gate, never from one dependency such as receiver configuration.",
  noDiagnostics:
    "Public users do not receive the internal list of missing Bitcoin dependencies, credentials, endpoints or configuration state.",
  noFalseFailure:
    "When Bitcoin is unavailable, VIA does not describe that as a failed Bitcoin payment because no Bitcoin payment was offered.",
  alternatives:
    "Checkout may continue to show other payment methods that are independently ready; Bitcoin readiness never changes their state.",
  noPayment:
    "Availability projection performs no signing, payment confirmation, settlement, forwarding or blockchain write.",
} as const
