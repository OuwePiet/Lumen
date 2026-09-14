import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../deso-api"

export const dynamic = "force-dynamic"

const PUBLIC_KEY_RE = /^[1-9A-HJ-NP-Za-km-z]{20,100}$/

type DeSoUser = {
  PublicKeyBase58Check?: unknown
  BalanceNanos?: unknown
  UnminedBalanceNanos?: unknown
}

type DeSoUsersResponse = {
  UserList?: unknown
}

function safeNanos(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const publicKey = (url.searchParams.get("publicKey") ?? "").trim()

  if (!PUBLIC_KEY_RE.test(publicKey)) {
    return NextResponse.json({ ok: false, error: "INVALID_PUBLIC_KEY" }, { status: 400, headers: { "Cache-Control": "no-store" } })
  }

  try {
    const response = await fetchDeSo("get-users-stateless", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        PublicKeysBase58Check: [publicKey],
        SkipForLeaderboard: false,
        GetUnminedBalance: false,
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: "WALLET_READ_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } })
    }

    const data = (await response.json()) as DeSoUsersResponse
    const list = Array.isArray(data.UserList) ? data.UserList as DeSoUser[] : []
    const user = list.find((entry) => entry?.PublicKeyBase58Check === publicKey) ?? list[0]

    if (!user) {
      return NextResponse.json({ ok: false, error: "WALLET_NOT_FOUND" }, { status: 404, headers: { "Cache-Control": "no-store" } })
    }

    const balanceNanos = safeNanos(user.BalanceNanos)
    const unminedBalanceNanos = safeNanos(user.UnminedBalanceNanos)

    return NextResponse.json(
      {
        ok: true,
        wallet: {
          publicKey,
          balanceNanos,
          unminedBalanceNanos,
          balanceDeSo: balanceNanos / 1_000_000_000,
        },
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    )
  } catch {
    return NextResponse.json({ ok: false, error: "WALLET_READ_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } })
  }
}
