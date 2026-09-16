"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"
import { fetchViaRates, isViaRateStale, VIA_RATE_REFRESH_MS } from "../via-live-rates"

type CreatorCoinHolding = {
  creatorPublicKey: string
  username: string
  balanceNanos: number
  balanceCoins: number
  hasPurchased: boolean
}

type WalletData = {
  publicKey: string
  balanceNanos: number
  unminedBalanceNanos: number
  balanceDeSo: number
  creatorCoinHoldings: CreatorCoinHolding[]
}

type WalletResponse = {
  ok?: boolean
  wallet?: WalletData
}

const quietAction = "inline-flex min-h-10 items-center rounded-[10px] border border-zinc-700/80 bg-transparent px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-[#8fd4a9]/50 hover:text-[#9adbb2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15"

function formatDeSo(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 9 }).format(value)
}

function formatCurrency(value: number, currency: "USD" | "EUR") {
  return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(value)
}

function shortPublicKey(publicKey: string) {
  if (publicKey.length <= 20) return publicKey
  return `${publicKey.slice(0, 10)}…${publicKey.slice(-6)}`
}

function CoinList({ title, holdings }: { title: string; holdings: CreatorCoinHolding[] }) {
  return (
    <section className="rounded-[16px] border border-zinc-800/80 bg-zinc-950/45 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium text-zinc-100">{title}</h2>
        <span className="rounded-full border border-zinc-800 px-2.5 py-1 text-xs text-zinc-500">{holdings.length}</span>
      </div>
      {holdings.length ? (
        <div className="mt-4 divide-y divide-zinc-800/80">
          {holdings.map((holding) => (
            <div key={`${title}-${holding.creatorPublicKey}`} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <Link href={`/profile/${encodeURIComponent(holding.creatorPublicKey)}`} className="min-w-0 text-sm text-zinc-200 transition hover:text-[#9adbb2]">
                {holding.username ? `@${holding.username}` : shortPublicKey(holding.creatorPublicKey)}
              </Link>
              <span className="text-sm font-medium text-zinc-300">{formatDeSo(holding.balanceCoins)} coins</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-zinc-500">No creator coins in this category.</p>
      )}
    </section>
  )
}

export default function WalletPage() {
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [desoUsd, setDesoUsd] = useState<number | null>(null)
  const [desoEur, setDesoEur] = useState<number | null>(null)

  useEffect(() => {
    const restore = () => setSession(restoreIdentitySession())
    restore()
    window.addEventListener(VIA_IDENTITY_EVENT, restore)
    return () => window.removeEventListener(VIA_IDENTITY_EVENT, restore)
  }, [])

  useEffect(() => {
    if (!session?.publicKey) {
      setWallet(null)
      setLoading(false)
      return
    }

    let active = true
    let controller: AbortController | null = null

    const refreshWallet = async () => {
      controller?.abort()
      controller = new AbortController()
      try {
        const response = await fetch(`/api/via/wallet?publicKey=${encodeURIComponent(session.publicKey)}`, {
          cache: "no-store",
          signal: controller.signal,
          headers: { Accept: "application/json" },
        })
        const data = response.ok ? (await response.json()) as WalletResponse : null
        if (!response.ok || !data?.ok || !data.wallet) throw new Error("WALLET_UNAVAILABLE")
        if (!active) return
        setWallet(data.wallet)
        setError("")
      } catch (reason) {
        if (active && !(reason instanceof DOMException && reason.name === "AbortError")) {
          setError("Wallet balance is temporarily unavailable.")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    setLoading(true)
    setError("")
    void refreshWallet()
    const timer = window.setInterval(refreshWallet, 60_000)

    return () => {
      active = false
      controller?.abort()
      window.clearInterval(timer)
    }
  }, [session?.publicKey])

  useEffect(() => {
    let active = true
    let controller: AbortController | null = null

    const refreshRates = async () => {
      controller?.abort()
      controller = new AbortController()
      try {
        const rates = await fetchViaRates(controller.signal)
        const usd = rates.rates?.USD
        const eur = rates.rates?.EUR
        const current = !isViaRateStale(rates.checkedAt)
        if (!active) return
        setDesoUsd(current && typeof usd === "number" && Number.isFinite(usd) && usd > 0 ? usd : null)
        setDesoEur(current && typeof eur === "number" && Number.isFinite(eur) && eur > 0 ? eur : null)
      } catch (reason) {
        if (active && !(reason instanceof DOMException && reason.name === "AbortError")) {
          setDesoUsd(null)
          setDesoEur(null)
        }
      }
    }

    void refreshRates()
    const timer = window.setInterval(refreshRates, VIA_RATE_REFRESH_MS)
    return () => {
      active = false
      controller?.abort()
      window.clearInterval(timer)
    }
  }, [])

  const bought = wallet?.creatorCoinHoldings.filter((holding) => holding.hasPurchased) ?? []
  const received = wallet?.creatorCoinHoldings.filter((holding) => !holding.hasPurchased) ?? []
  const balanceUsd = wallet && desoUsd !== null ? wallet.balanceDeSo * desoUsd : null
  const balanceEur = wallet && desoEur !== null ? wallet.balanceDeSo * desoEur : null

  async function copyPublicKey() {
    if (!wallet?.publicKey || !navigator.clipboard) return
    await navigator.clipboard.writeText(wallet.publicKey)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <main className="min-h-screen bg-[#050807] px-5 py-8 text-zinc-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">VIA · WALLET</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.25rem]">Your DeSo wallet</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">Read-only wallet information for the DeSo account currently connected to VIA.</p>
          </div>
          <Link href="/my-via" className={quietAction}>Back to My VIA</Link>
        </header>

        {!session ? (
          <section className="rounded-[16px] border border-zinc-800/80 bg-zinc-950/50 p-6">
            <h2 className="text-xl font-medium">No DeSo account connected</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Use the VIA account button above to log in with DeSo Identity.</p>
          </section>
        ) : loading ? (
          <section className="rounded-[16px] border border-zinc-800/80 bg-zinc-950/50 p-6 text-sm text-zinc-400">Loading wallet…</section>
        ) : error && !wallet ? (
          <section className="rounded-[16px] border border-amber-900/40 bg-amber-950/10 p-6 text-sm text-amber-200">{error}</section>
        ) : wallet ? (
          <div className="grid gap-5">
            {error ? <section className="rounded-[14px] border border-amber-900/30 bg-amber-950/10 px-4 py-3 text-xs text-amber-200">{error} Showing the last available wallet data.</section> : null}
            <section className="rounded-[18px] border border-[#8fd4a9]/25 bg-zinc-950/55 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Available balance</p>
              <div className="mt-3 text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">{formatDeSo(wallet.balanceDeSo)} <span className="text-xl text-zinc-400">DESO</span></div>
              {balanceUsd !== null || balanceEur !== null ? (
                <p className="mt-2 text-sm font-medium text-zinc-400">
                  ≈ {[balanceUsd !== null ? formatCurrency(balanceUsd, "USD") : null, balanceEur !== null ? formatCurrency(balanceEur, "EUR") : null].filter(Boolean).join(" · ")} at the current VIA DESO reference rate
                </p>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-zinc-400">
                <span className="rounded-full border border-zinc-800 px-3 py-1.5">{wallet.creatorCoinHoldings.length} creator coins</span>
                <span className="rounded-full border border-zinc-800 px-3 py-1.5">{bought.length} bought</span>
                <span className="rounded-full border border-zinc-800 px-3 py-1.5">{received.length} received</span>
              </div>
              <p className="mt-4 text-xs leading-5 text-zinc-500">Balances are read directly from DeSo. VIA does not hold these funds or coins.</p>
            </section>

            <div className="grid gap-5 md:grid-cols-2">
              <CoinList title="Creator coins · Bought" holdings={bought} />
              <CoinList title="Creator coins · Received" holdings={received} />
            </div>

            <section className="rounded-[16px] border border-zinc-800/80 bg-zinc-950/45 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-medium text-zinc-100">Public key</h2>
                <button type="button" onClick={() => void copyPublicKey()} className={quietAction}>{copied ? "Copied" : "Copy public key"}</button>
              </div>
              <p className="mt-3 break-all font-mono text-xs leading-6 text-zinc-400">{wallet.publicKey}</p>
            </section>

            <section className="rounded-[16px] border border-zinc-800/80 bg-zinc-950/45 p-6">
              <h2 className="text-lg font-medium text-zinc-100">Wallet boundary</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">This page is deliberately read-only. Send, buy, swap and withdrawal actions are not exposed here until each transaction flow is separately verified with DeSo Identity approval.</p>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  )
}
