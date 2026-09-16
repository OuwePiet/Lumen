"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"

type PublicProfile = {
  publicKey: string
  username: string
  description: string
  profilePic: string | null
  isVerified: boolean
  creatorBasisPoints: number | null
  coinPriceDeSoNanos: number | null
  numberOfHolders: number | null
  coinsInCirculationNanos: number | null
  followersCount: number | null
  followingCount: number | null
}

type ProfileResponse = { ok?: boolean; profile?: PublicProfile }

const quietAction = "inline-flex min-h-10 items-center rounded-[10px] border border-zinc-700/80 bg-transparent px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-[#8fd4a9]/50 hover:text-[#9adbb2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15"
const metricLink = "rounded-[12px] border border-zinc-800/80 bg-black/25 p-3 transition-colors hover:border-[#8fd4a9]/45 hover:bg-[#0d1712] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15"

function safeImage(value: string | null) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

function formatDeSoNanos(value: number | null) {
  if (value === null) return "—"
  const deso = value / 1_000_000_000
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(deso)} DESO`
}

function formatBasisPoints(value: number | null) {
  if (value === null) return "—"
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value / 100)}%`
}

function formatCompact(value: number | null) {
  if (value === null) return "—"
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value)
}

function formatCoins(value: number | null) {
  if (value === null) return "—"
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(value / 1_000_000_000)
}

export default function ProfilePage() {
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const restore = () => setSession(restoreIdentitySession())
    restore()
    window.addEventListener(VIA_IDENTITY_EVENT, restore)
    return () => window.removeEventListener(VIA_IDENTITY_EVENT, restore)
  }, [])

  useEffect(() => {
    if (!session?.publicKey) {
      setProfile(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError("")
    void fetch(`/api/via/profile?identity=${encodeURIComponent(session.publicKey)}`, {
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const data = response.ok ? (await response.json()) as ProfileResponse : null
        if (!response.ok || !data?.ok || !data.profile) throw new Error("PROFILE_UNAVAILABLE")
        return data.profile
      })
      .then(setProfile)
      .catch((reason) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) {
          setProfile(null)
          setError("Your DeSo profile could not be loaded right now.")
        }
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [session?.publicKey])

  const image = safeImage(profile?.profilePic ?? null)

  return (
    <main className="min-h-screen bg-[#050807] px-5 py-8 text-zinc-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">VIA · PROFILE</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.25rem]">Profile</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Your signed-in public DeSo identity, shown without requesting extra wallet authority.</p>
          </div>
          <Link href="/my-via" className={quietAction}>Back to My VIA</Link>
        </header>

        {!session ? (
          <section className="rounded-[14px] border border-zinc-800/80 bg-zinc-950/50 p-6">
            <h2 className="text-xl font-medium">No DeSo account connected</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Use the account button in the VIA header to log in with DeSo Identity.</p>
          </section>
        ) : loading ? (
          <section className="rounded-[14px] border border-zinc-800/80 bg-zinc-950/50 p-6 text-sm text-zinc-400">Loading your DeSo profile…</section>
        ) : error ? (
          <section className="rounded-[14px] border border-zinc-800/80 bg-zinc-950/50 p-6 text-sm text-zinc-400" role="status">{error}</section>
        ) : profile ? (
          <section className="rounded-[16px] border border-zinc-800/80 bg-zinc-950/55 p-6 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              {image ? (
                <img src={image} alt="" className="h-24 w-24 rounded-full border border-zinc-800 object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-full border border-[#8fd4a9]/30 bg-[#112019] text-2xl font-semibold text-[#9adbb2]" aria-hidden="true">{profile.username.slice(0, 1).toUpperCase() || "V"}</div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold text-zinc-100">@{profile.username}</h2>
                  {profile.isVerified ? (
                    <span className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-1 text-xs font-medium text-sky-300" title="Verified by the connected DeSo profile source">✓ DeSo verified</span>
                  ) : null}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <div className="rounded-[12px] border border-zinc-800/80 bg-black/25 p-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Coin price</p>
                    <p className="mt-1 text-sm font-medium text-zinc-100">{formatDeSoNanos(profile.coinPriceDeSoNanos)}</p>
                  </div>
                  <Link href={`/profile/connections?mode=followers&identity=${encodeURIComponent(profile.publicKey)}`} className={metricLink}>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Followers</p>
                    <p className="mt-1 text-sm font-medium text-zinc-100">{formatCompact(profile.followersCount)}</p>
                  </Link>
                  <Link href={`/profile/connections?mode=following&identity=${encodeURIComponent(profile.publicKey)}`} className={metricLink}>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Following</p>
                    <p className="mt-1 text-sm font-medium text-zinc-100">{formatCompact(profile.followingCount)}</p>
                  </Link>
                  <div className="rounded-[12px] border border-zinc-800/80 bg-black/25 p-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">FR</p>
                    <p className="mt-1 text-sm font-medium text-zinc-100">{formatBasisPoints(profile.creatorBasisPoints)}</p>
                  </div>
                  <div className="rounded-[12px] border border-zinc-800/80 bg-black/25 p-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Coin holders</p>
                    <p className="mt-1 text-sm font-medium text-zinc-100">{formatCompact(profile.numberOfHolders)}</p>
                  </div>
                  <div className="rounded-[12px] border border-zinc-800/80 bg-black/25 p-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Coins in circulation</p>
                    <p className="mt-1 text-sm font-medium text-zinc-100">{formatCoins(profile.coinsInCirculationNanos)}</p>
                  </div>
                </div>

                <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{profile.description || "No public bio on this DeSo profile."}</p>
                <div className="mt-5 rounded-[12px] border border-zinc-800/80 bg-black/25 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Public key</p>
                  <p className="mt-2 break-all font-mono text-xs leading-5 text-zinc-400">{profile.publicKey}</p>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}
