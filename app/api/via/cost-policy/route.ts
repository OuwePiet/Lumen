import { NextResponse } from "next/server"
import { currentViaCostPolicy } from "../../../../lib/via/cost-transparency-policy"

export const dynamic = "force-dynamic"

export async function GET() {
  const policy = currentViaCostPolicy()
  return NextResponse.json(
    {
      policy,
      quotedAt: new Date().toISOString(),
      paymentAuthorized: false,
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}
