"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { restoreIdentitySession } from "../../deso-identity-session"

type Connection = {
  publicKey: string
  username: string
  description: string
  profilePic: string | null
  isVerified: boolean
  creatorBasisPoints: number | null
  coinPriceDeSoNanos: number | null
}

type ConnectionsResponse = {
  ok?: boolean
  mode?: "followers" | "following"
  total?: number
  entries?: Connection[]
}

type SortMode = "name" | "coin" | "fr"

function formatCoin(value: number | null) {
  if (value === null) return "—"
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(value / 1_000_000_000)} DESO`
}

function formatFr(value: number | null) {
  if (value === null) return "—"
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value / 100)}%`
}

export default function ProfileConnectionsPage() {
  const [identity, setIdentity] = useState("")
  const [mode, setMode] = useState<"followers" | "following">("followers")
  const [entries, setEntries] = useState<Connection[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>("name")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const requestedMode = params.get("mode") === "following" ? "following" : "followers"
    const requestedIdentity = (params.get("identity") ?? "").trim()
    const session = restoreIdentitySession()
    setMode(requestedMode)
    setIdentity(requestedIdentity || session?.publicKey || "")
  }, [])

  useEffect(() => {
    if (!identity) {
      setEntries([])
      setTotal(0)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError("")
    void fetch(`/api/via/connections?identity=${encodeURIComponent(identity)}&mode=${mode}&limit=100`, {
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const data = response.ok ? (await response.json()) as ConnectionsResponse : null
        if (!response.ok || !data?.ok) throw new Error("CONNECTIONS_UNAVAILABLE")
        return data
      })
      .then((data) => {
        setEntries(Array.isArray(data.entries) ? data.entries : [])
        setTotal(typeof data.total === "number" ? data.total : 0)
      })
      .catch((reason) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) {
          setEntries([])
          setTotal(0)
          setError("These DeSo connections could not be loaded right now.")
        }
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [identity, mode])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const result = entries.filter((entry) => {
      if (verifiedOnly && !entry.isVerified) return false
      if (!needle) return true
      return entry.username.toLowerCase().includes(needle) || entry.description.toLowerCase().includes(needle)
    })

    return [...result].sort((a, b) => {
      if (sortMode === "coin") return (b.coinPriceDeSoNanos ?? -1) - (a.coinPriceDeSoNanos ?? -1)
      if (sortMode === "fr") return (b.creatorBasisPoints ?? -1) - (a.creatorBasisPoints ?? -1)
      return a.username.localeCompare(b.username, undefined, { sensitivity: "base" })
    })
  }, [entries, query, sortMode, verifiedOnly])

  function changeMode(next: "followers" | "following") {
    setMode(next)
    const url = new URL(window.location.href)
    url.searchParams.set("mode", next)
    if (identity) url.searchParams.set("identity", identity)
    window.history.replaceState(null, "", url)
  }

  const profileHref = identity ? `/profile/${encodeURIComponent(identity)}` : "/profile"

  return (
    <main className="min-h-screen bg-[#050807] px-5 py-8 text-zinc-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">VIA · PROFILE</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Connections</h1>
            <p className="mt-2 text-sm text-zinc-400">Public DeSo followers and following, arranged in VIA.</p>
          </div>
          <Link href={profileHref} className="rounded-[10px] border border-zinc-700/80 px-3 py-2 text-sm text-zinc-300 transition hover:border-[#8fd4a9]/50 hover:text-[#9adbb2]">Back to profile</Link>
        </header>

        <section className="mt-7 rounded-[16px] border border-zinc-800/80 bg-zinc-950/55 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => changeMode("followers")} className={`rounded-full border px-4 py-2 text-sm ${mode === "followers" ? "border-[#8fd4a9]/50 bg-[#102019] text-[#9adbb2]" : "border-zinc-800 text-zinc-400"}`}>Followers</button>
            <button type="button" onClick={() => changeMode("following")} className={`rounded-full border px-4 py-2 text-sm ${mode === "following" ? "border-[#8fd4a9]/50 bg-[#102019] text-[#9adbb2]" : "border-zinc-800 text-zinc-400"}`}>Following</button>
            <span className="ml-auto text-sm text-zinc-500">{total.toLocaleString("en-US")} total</span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or bio" className="min-h-11 rounded-[10px] border border-zinc-800 bg-black/30 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-[#8fd4a9]/50" />
            <label className="flex min-h-11 items-center gap-2 rounded-[10px] border border-zinc-800 px-3 text-sm text-zinc-300">
              <input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} />
              DeSo verified
            </label>
            <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} className="min-h-11 rounded-[10px] border border-zinc-800 bg-black/30 px-3 text-sm text-zinc-300 outline-none">
              <option value="name">Name</option>
              <option value="coin">Coin price</option>
              <option value="fr">FR</option>
            </select>
          </div>
        </section>

        <section className="mt-4 space-y-2">
          {!identity ? (
            <div className="rounded-[14px] border border-zinc-800/80 bg-zinc-950/50 p-5 text-sm text-zinc-400">Connect a DeSo identity or open this page from a profile.</div>
          ) : loading ? (
            <div className="rounded-[14px] border border-zinc-800/80 bg-zinc-950/50 p-5 text-sm text-zinc-400">Loading connections…</div>
          ) : error ? (
            <div className="rounded-[14px] border border-zinc-800/80 bg-zinc-950/50 p-5 text-sm text-zinc-400" role="status">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[14px] border border-zinc-800/80 bg-zinc-950/50 p-5 text-sm text-zinc-500">No matching connections.</div>
          ) : filtered.map((entry) => (
            <Link
              key={entry.publicKey}
              href={`/profile/${encodeURIComponent(entry.publicKey)}`}
              className="flex items-start gap-4 rounded-[14px] border border-zinc-800/80 bg-zinc-950/50 p-4 transition hover:border-[#8fd4a9]/50 hover:bg-zinc-950/70"
              aria-label={`Open profile for ${entry.username ? `@${entry.username}` : entry.publicKey}`}
            >
              {entry.profilePic ? (
                <img src={entry.profilePic} alt="" className="h-12 w-12 rounded-full border border-zinc-800 object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#8fd4a9]/30 bg-[#112019] font-semibold text-[#9adbb2]">{entry.username.slice(0, 1).toUpperCase() || "V"}</div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-zinc-100">@{entry.username || entry.publicKey.slice(0, 10)}</p>
                  {entry.isVerified ? <span className="text-xs text-sky-300" title="Verified by the connected DeSo profile source">✓ DeSo</span> : null}
                </div>
                {entry.description ? <p className="mt-1 line-clamp-2 text-sm leading-5 text-zinc-400">{entry.description}</p> : null}
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                  <span>Coin {formatCoin(entry.coinPriceDeSoNanos)}</span>
                  <span>FR {formatFr(entry.creatorBasisPoints)}</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  )
}
