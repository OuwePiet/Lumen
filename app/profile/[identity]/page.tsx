"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

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

function formatCoin(value: number | null) {
  if (value === null) return "—"
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(value / 1_000_000_000)} DESO`
}

function formatFr(value: number | null) {
  if (value === null) return "—"
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value / 100)}%`
}

function formatNumber(value: number | null) {
  if (value === null) return "—"
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value)
}

export default function PublicProfilePage() {
  const params = useParams<{ identity: string }>()
  const identity = decodeURIComponent(params?.identity ?? "").trim()
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAvatar, setShowAvatar] = useState(false)

  useEffect(() => {
    if (!identity) {
      setLoading(false)
      setError("Profile unavailable.")
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError("")
    void fetch(`/api/via/profile?identity=${encodeURIComponent(identity)}`, {
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
          setError("This DeSo profile could not be loaded right now.")
        }
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [identity])

  return (
    <main className="min-h-screen bg-[#050807] px-5 py-8 text-zinc-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">VIA · PUBLIC PROFILE</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Profile</h1>
          </div>
          <Link href="/social" className="rounded-[10px] border border-zinc-700/80 px-3 py-2 text-sm text-zinc-300 transition hover:border-[#8fd4a9]/50 hover:text-[#9adbb2]">Back to Social</Link>
        </header>

        {loading ? (
          <div className="rounded-[16px] border border-zinc-800/80 bg-zinc-950/55 p-6 text-sm text-zinc-400">Loading profile…</div>
        ) : error ? (
          <div className="rounded-[16px] border border-zinc-800/80 bg-zinc-950/55 p-6 text-sm text-zinc-400" role="status">{error}</div>
        ) : profile ? (
          <section className="rounded-[18px] border border-zinc-800/80 bg-zinc-950/55 p-6 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="shrink-0">
                {profile.profilePic ? (
                  <button type="button" onClick={() => setShowAvatar(true)} className="group relative block rounded-full" aria-label="View profile photo">
                    <img src={profile.profilePic} alt="" className="h-28 w-28 rounded-full border border-zinc-800 object-cover" referrerPolicy="no-referrer" />
                    <span className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full border border-zinc-700 bg-black/80 text-sm text-zinc-200 group-hover:border-[#8fd4a9]/50" aria-hidden="true">◉</span>
                  </button>
                ) : (
                  <div className="grid h-28 w-28 place-items-center rounded-full border border-[#8fd4a9]/30 bg-[#112019] text-3xl font-semibold text-[#9adbb2]">{profile.username.slice(0, 1).toUpperCase() || "V"}</div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold">@{profile.username}</h2>
                  {profile.isVerified ? <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-1 text-xs text-sky-300">✓ DeSo verified</span> : null}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <Link href={`/profile/connections?identity=${encodeURIComponent(profile.publicKey)}&mode=followers`} className="rounded-[12px] border border-zinc-800/80 bg-black/25 p-3 transition hover:border-[#8fd4a9]/50">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Followers</p>
                    <p className="mt-1 text-sm font-medium">{formatNumber(profile.followersCount)}</p>
                  </Link>
                  <Link href={`/profile/connections?identity=${encodeURIComponent(profile.publicKey)}&mode=following`} className="rounded-[12px] border border-zinc-800/80 bg-black/25 p-3 transition hover:border-[#8fd4a9]/50">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Following</p>
                    <p className="mt-1 text-sm font-medium">{formatNumber(profile.followingCount)}</p>
                  </Link>
                  <div className="rounded-[12px] border border-zinc-800/80 bg-black/25 p-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Coin value</p>
                    <p className="mt-1 text-sm font-medium">{formatCoin(profile.coinPriceDeSoNanos)}</p>
                  </div>
                  <div className="rounded-[12px] border border-zinc-800/80 bg-black/25 p-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">FR</p>
                    <p className="mt-1 text-sm font-medium">{formatFr(profile.creatorBasisPoints)}</p>
                  </div>
                  <div className="rounded-[12px] border border-zinc-800/80 bg-black/25 p-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Coin holders</p>
                    <p className="mt-1 text-sm font-medium">{formatNumber(profile.numberOfHolders)}</p>
                  </div>
                </div>

                <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{profile.description || "No public bio on this DeSo profile."}</p>
              </div>
            </div>
          </section>
        ) : null}
      </div>

      {showAvatar && profile?.profilePic ? (
        <button type="button" onClick={() => setShowAvatar(false)} className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-6" aria-label="Close profile photo">
          <img src={profile.profilePic} alt="" className="max-h-[80vh] max-w-[80vw] rounded-[18px] border border-zinc-700 object-contain shadow-2xl" referrerPolicy="no-referrer" />
        </button>
      ) : null}
    </main>
  )
}
