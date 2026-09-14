"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"

type WalletData = {
  publicKey: string
  balanceNanos: number
  unminedBalanceNanos: number
  balanceDeSo: number
}

type WalletResponse = {
  ok?: boolean
  wallet?: WalletData
}

const quietAction = "inline-flex min-h-10 items-center rounded-[10px] border border-zinc-700/80 bg-transparent px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-[#8fd4a9]/50 hover:text-[#9adbb2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15"

function formatDeSo(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 9 }).format(value)
}

export default function WalletPage() {
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [wallet, setWallet] = useState<WalletData | null>(null)
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
      setWallet(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError("")

    void fetch(`/api/via/wallet?publicKey=${encodeURIComponent(session.publicKey)}`, {
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const data = response.ok ? (await response.json()) as WalletResponse : null
        if (!response.ok || !data?.ok || !data.wallet) throw new Error("WALLET_UNAVAILABLE")
        return data.wallet
      })
      .then(setWallet)
      .catch((reason) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) {
          setWallet(null)
          setError("Wallet balance is temporarily unavailable.")
        }
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [session?.publicKey])

  return (
    <main className="min-h-screen bg-[#050807] px-5 py-8 text-zinc-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">VIA · WALLET</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.25rem]">Your DeSo balance</h1>
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
          <section className="rounded-[16px] border border-zinc-800/80 bg-zinc-950/50 p-6 text-sm text-zinc-400">Loading wallet balance…</section>
        ) : error ? (
          <section className="rounded-[16px] border border-amber-900/40 bg-amber-950/10 p-6 text-sm text-amber-200">{error}</section>
        ) : wallet ? (
          <div className="grid gap-5">
            <section className="rounded-[18px] border border-[#8fd4a9]/25 bg-zinc-950/55 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">Available balance</p>
              <div className="mt-3 text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">{formatDeSo(wallet.balanceDeSo)} <span className="text-xl text-zinc-400">DESO</span></div>
              <p className="mt-4 text-xs leading-5 text-zinc-500">Balance is read directly from the DeSo node. VIA does not hold these funds.</p>
            </section>

            <section className="rounded-[16px] border border-zinc-800/80 bg-zinc-950/45 p-6">
              <h2 className="text-lg font-medium text-zinc-100">Public key</h2>
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
