import { NextResponse } from "next/server"
import { fetchDeSo } from "../../../deso-api"

export const dynamic = "force-dynamic"

const PUBLIC_KEY_RE = /^[1-9A-HJ-NP-Za-km-z]{20,100}$/

type DeSoProfile = {
  Username?: unknown
  PublicKeyBase58Check?: unknown
}

type DeSoCreatorCoinHolding = {
  CreatorPublicKeyBase58Check?: unknown
  BalanceNanos?: unknown
  HasPurchased?: unknown
  ProfileEntryResponse?: unknown
}

type DeSoUser = {
  PublicKeyBase58Check?: unknown
  BalanceNanos?: unknown
  UnminedBalanceNanos?: unknown
  UsersYouHODL?: unknown
}

type DeSoUsersResponse = {
  UserList?: unknown
}

function safeNanos(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
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
    const creatorCoinHoldings = (Array.isArray(user.UsersYouHODL) ? user.UsersYouHODL as DeSoCreatorCoinHolding[] : [])
      .map((entry) => {
        const profile = entry?.ProfileEntryResponse && typeof entry.ProfileEntryResponse === "object"
          ? entry.ProfileEntryResponse as DeSoProfile
          : null
        const creatorPublicKey = text(entry?.CreatorPublicKeyBase58Check) || text(profile?.PublicKeyBase58Check)
        const holdingBalanceNanos = safeNanos(entry?.BalanceNanos)
        if (!creatorPublicKey || holdingBalanceNanos <= 0) return null
        return {
          creatorPublicKey,
          username: text(profile?.Username),
          balanceNanos: holdingBalanceNanos,
          balanceCoins: holdingBalanceNanos / 1_000_000_000,
          hasPurchased: entry?.HasPurchased === true,
        }
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))

    return NextResponse.json(
      {
        ok: true,
        wallet: {
          publicKey,
          balanceNanos,
          unminedBalanceNanos,
          balanceDeSo: balanceNanos / 1_000_000_000,
          creatorCoinHoldings,
        },
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    )
  } catch {
    return NextResponse.json({ ok: false, error: "WALLET_READ_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } })
  }
}
