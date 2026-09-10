import { NextResponse } from "next/server"

const DEFAULT_DESO_NODE = "https://node.deso.org"
const POLL_ASSOCIATION_TYPE = "POLL_RESPONSE"
const MAX_RESULTS = 100

function desoNode() {
  const raw = (process.env.DESO_NODE || DEFAULT_DESO_NODE).trim().replace(/\/$/, "")
  try {
    const url = new URL(raw)
    return url.protocol === "https:" ? url.toString().replace(/\/$/, "") : DEFAULT_DESO_NODE
  } catch {
    return DEFAULT_DESO_NODE
  }
}

function validPostHash(value: string | null) {
  return value && /^[0-9a-fA-F]{64}$/.test(value) ? value : null
}

function validPublicKey(value: string | null) {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length >= 40 && trimmed.length <= 80 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmed) ? trimmed : null
}

type Association = {
  AssociationID?: string
  TransactorPublicKeyBase58Check?: string
  PostHashHex?: string
  AssociationType?: string
  AssociationValue?: string
  BlockHeight?: number
}

type QueryResponse = {
  Associations?: Association[]
}

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const postHash = validPostHash(url.searchParams.get("postHash"))
  const voter = validPublicKey(url.searchParams.get("voter"))

  if (!postHash) {
    return NextResponse.json({ ok: false, error: "INVALID_POST_HASH" }, { status: 400 })
  }

  if (url.searchParams.has("voter") && !voter) {
    return NextResponse.json({ ok: false, error: "INVALID_VOTER_PUBLIC_KEY" }, { status: 400 })
  }

  try {
    const response = await fetch(`${desoNode()}/api/v0/post-associations/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        PostHashHex: postHash,
        TransactorPublicKeyBase58Check: voter || "",
        AssociationType: POLL_ASSOCIATION_TYPE,
        Limit: MAX_RESULTS,
        SortDescending: true,
        IncludeTransactorProfile: false,
        IncludePostEntry: false,
        IncludePostAuthorProfile: false,
        IncludeAppProfile: false,
      }),
    })

    if (!response.ok) throw new Error("DESO_POLL_READ_FAILED")
    const data = await response.json() as QueryResponse
    const raw = Array.isArray(data.Associations) ? data.Associations : []

    const responses = raw
      .filter((item) => item?.AssociationType === POLL_ASSOCIATION_TYPE && item?.PostHashHex === postHash)
      .map((item) => ({
        associationId: typeof item.AssociationID === "string" ? item.AssociationID : "",
        voterPublicKey: typeof item.TransactorPublicKeyBase58Check === "string" ? item.TransactorPublicKeyBase58Check : "",
        option: typeof item.AssociationValue === "string" ? item.AssociationValue : "",
        blockHeight: typeof item.BlockHeight === "number" ? item.BlockHeight : null,
      }))
      .filter((item) => item.associationId && item.voterPublicKey && item.option)

    return NextResponse.json(
      {
        ok: true,
        source: "deso-post-associations",
        associationType: POLL_ASSOCIATION_TYPE,
        postHash,
        voter: voter || null,
        responses,
        resultLimit: MAX_RESULTS,
        truncated: raw.length >= MAX_RESULTS,
        countsFinal: false,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    )
  } catch {
    return NextResponse.json(
      { ok: false, error: "POLL_READ_UNAVAILABLE" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }
}
