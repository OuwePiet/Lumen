import { NextResponse } from "next/server"
import { paymentMethodAvailability } from "../../../../lib/via/payment-method-boundary-v2"

export const dynamic = "force-dynamic"

function configured(name: string): boolean {
  return process.env[name]?.trim() === "true"
}

export async function GET() {
  const methods = paymentMethodAvailability({
    fiatOperational:
      configured("VIA_FIAT_PROVIDER_READY") &&
      configured("VIA_FIAT_CALLBACK_READY"),
    bitcoinOperational:
      configured("VIA_BITCOIN_RECEIVER_READY") &&
      configured("VIA_BITCOIN_RATE_PROVIDER_READY") &&
      configured("VIA_BITCOIN_OBSERVER_READY") &&
      configured("VIA_BITCOIN_INTEGRATION_TESTS_READY") &&
      configured("VIA_BITCOIN_STABLE_READY"),
    desoOperational: false,
  })

  return NextResponse.json(
    {
      methods: methods.map(({ method, actionable, priority }) => ({
        method,
        actionable,
        priority,
      })),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  )
}
