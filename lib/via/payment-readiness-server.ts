import { paymentMethodAvailability } from "./payment-method-boundary-v2"

function envReady(name: string): boolean {
  return process.env[name]?.trim() === "true"
}

export function currentPaymentReadiness() {
  const fiatOperational =
    envReady("VIA_FIAT_PROVIDER_READY") &&
    envReady("VIA_FIAT_CALLBACK_READY")

  const bitcoinOperational =
    envReady("VIA_BITCOIN_RECEIVER_READY") &&
    envReady("VIA_BITCOIN_RATE_PROVIDER_READY") &&
    envReady("VIA_BITCOIN_OBSERVER_READY") &&
    envReady("VIA_BITCOIN_INTEGRATION_TESTS_READY") &&
    envReady("VIA_BITCOIN_STABLE_READY")

  return {
    fiatOperational,
    bitcoinOperational,
    desoOperational: false,
    methods: paymentMethodAvailability({
      fiatOperational,
      bitcoinOperational,
      desoOperational: false,
    }),
  }
}

export const VIA_PAYMENT_READINESS_SERVER_RULES = {
  oneSource:
    "API routes and server-rendered payment surfaces use this shared server helper instead of independently reimplementing environment readiness logic.",
  private:
    "Only derived readiness booleans/method state may leave the server; environment configuration values remain private.",
  failClosed:
    "Only the exact trimmed value true activates a deployment readiness signal; missing/unknown values are false.",
  deso:
    "DESO remains hard-disabled until its secure payment-write boundary is explicitly released.",
} as const
