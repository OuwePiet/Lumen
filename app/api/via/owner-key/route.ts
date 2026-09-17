import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../deso-api"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const response = await fetchDeSo("get-single-profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ PublicKeyBase58Check: "", Username: "OuwePiet" }),
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json({ publicKey: null }, { status: 503 })
    }

    const data = await response.json() as { Profile?: { PublicKeyBase58Check?: unknown } }
    const key = data.Profile?.PublicKeyBase58Check

    if (typeof key !== "string" || key.length < 20) {
      return NextResponse.json({ publicKey: null }, { status: 503 })
    }

    return NextResponse.json({ publicKey: key })
  } catch {
    return NextResponse.json({ publicKey: null }, { status: 503 })
  }
}
