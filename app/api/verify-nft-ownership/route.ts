import { NextRequest, NextResponse } from "next/server"
import { fetchDeSo } from "../../deso-api"
import { verifyOwnershipFromEntries } from "../../../lib/via/ownership-proof"

const HASH = /^[0-9a-fA-F]{64}$/
const PUBLIC_KEY = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{40,128}$/

export async function GET(request: NextRequest) {
  const postHash = request.nextUrl.searchParams.get("postHash") ?? ""
  const publicKey = request.nextUrl.searchParams.get("publicKey") ?? ""

  if (!HASH.test(postHash) || !PUBLIC_KEY.test(publicKey)) {
    return NextResponse.json({ ok: false, error: "Invalid verification input." }, { status: 400 })
  }

  try {
    const response = await fetchDeSo("get-nft-entries-for-nft-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ PostHashHex: postHash, ReaderPublicKeyBase58Check: "" }),
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: "DeSo ownership data unavailable." }, { status: 502 })
    }

    const data = await response.json()
    const entries = data.NFTEntryResponses ?? data.NFTEntries ?? data.NFTEntryResponse ?? []
    const proof = verifyOwnershipFromEntries(publicKey, Array.isArray(entries) ? entries : [])

    return NextResponse.json({
      ok: true,
      postHash: postHash.toLowerCase(),
      publicKey,
      ownsAnyEdition: proof.ownsAnyEdition,
      serialNumbers: proof.serialNumbers,
      checkedAt: new Date().toISOString(),
      note: "Read-only ownership check. This does not prove control of the public key.",
    })
  } catch {
    return NextResponse.json({ ok: false, error: "Ownership verification failed." }, { status: 502 })
  }
}
