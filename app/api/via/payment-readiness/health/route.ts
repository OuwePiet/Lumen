import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

function configured(name: string): boolean {
  return process.env[name]?.trim() === "true"
}

export async function GET() {
  const fiat =
    configured("VIA_FIAT_PROVIDER_READY") &&
    configured("VIA_FIAT_CALLBACK_READY")

  const bitcoin =
    configured("VIA_BITCOIN_RECEIVER_READY") &&
    configured("VIA_BITCOIN_RATE_PROVIDER_READY") &&
    configured("VIA_BITCOIN_OBSERVER_READY") &&
    configured("VIA_BITCOIN_INTEGRATION_TESTS_READY") &&
    configured("VIA_BITCOIN_STABLE_READY")

  return NextResponse.json(
    {
      service: "via-payment-readiness",
      healthy: true,
      routes: {
        fiat: fiat ? "ready" : "not-ready",
        bitcoin: bitcoin ? "ready" : "not-ready",
        deso: "not-released",
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}
