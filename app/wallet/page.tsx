"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "../deso-identity-session"
import ViaAuraCompact from "../via-aura-compact"
import { fetchViaRates, isViaRateStale, VIA_RATE_REFRESH_MS } from "../via-live-rates"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

type CreatorCoinHolding = {
  creatorPublicKey: string
  username: string
  profilePic: string | null
  isVerified: boolean
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

type Copy = {
  title: string
  intro: string
  back: string
  noAccount: string
  noAccountText: string
  loading: string
  unavailable: string
  stale: string
  available: string
  updated: string
  rate: string
  creatorCoins: string
  bought: string
  received: string
  balanceNote: string
  boughtTitle: string
  receivedTitle: string
  emptyCoins: string
  publicKey: string
  copied: string
  copyKey: string
  boundary: string
  boundaryText: string
  coins: string
}

const copies: Record<ViaLanguage, Copy> = {
  Dutch: {
    title: "Mijn Wallet",
    intro: "Alleen-lezen walletinformatie voor het DeSo-account dat momenteel met VIA is verbonden.",
    back: "Terug naar Mijn VIA",
    noAccount: "Geen DeSo-account verbonden",
    noAccountText: "Gebruik de VIA-accountknop hierboven om in te loggen met DeSo Identity.",
    loading: "Wallet laden…",
    unavailable: "Het walletsaldо is tijdelijk niet beschikbaar.",
    stale: "De laatst beschikbare walletgegevens worden getoond.",
    available: "Beschikbaar saldo",
    updated: "Laatst bijgewerkt",
    rate: "tegen de huidige VIA DESO-referentiekoers",
    creatorCoins: "creator coins",
    bought: "gekocht",
    received: "ontvangen",
    balanceNote: "Saldi worden rechtstreeks van DeSo gelezen. VIA bewaart deze fondsen of coins niet.",
    boughtTitle: "Creator coins · Gekocht",
    receivedTitle: "Creator coins · Ontvangen",
    emptyCoins: "Geen creator coins in deze categorie.",
    publicKey: "Publieke sleutel",
    copied: "Gekopieerd",
    copyKey: "Kopieer publieke sleutel",
    boundary: "Wallet-begrenzing",
    boundaryText: "Deze pagina is bewust alleen-lezen. Verzenden, kopen, swappen en opnemen worden hier pas aangeboden nadat elke transactiestroom afzonderlijk met DeSo Identity-goedkeuring is gecontroleerd.",
    coins: "coins",
  },
  English: {
    title: "My Wallet",
    intro: "Read-only wallet information for the DeSo account currently connected to VIA.",
    back: "Back to My VIA",
    noAccount: "No DeSo account connected",
    noAccountText: "Use the VIA account button above to log in with DeSo Identity.",
    loading: "Loading wallet…",
    unavailable: "Wallet balance is temporarily unavailable.",
    stale: "Showing the last available wallet data.",
    available: "Available balance",
    updated: "Last updated",
    rate: "at the current VIA DESO reference rate",
    creatorCoins: "creator coins",
    bought: "bought",
    received: "received",
    balanceNote: "Balances are read directly from DeSo. VIA does not hold these funds or coins.",
    boughtTitle: "Creator coins · Bought",
    receivedTitle: "Creator coins · Received",
    emptyCoins: "No creator coins in this category.",
    publicKey: "Public key",
    copied: "Copied",
    copyKey: "Copy public key",
    boundary: "Wallet boundary",
    boundaryText: "This page is deliberately read-only. Send, buy, swap and withdrawal actions are not exposed here until each transaction flow is separately verified with DeSo Identity approval.",
    coins: "coins",
  },
  French: {
    title: "Mon Wallet",
    intro: "Informations de portefeuille en lecture seule pour le compte DeSo actuellement connecté à VIA.",
    back: "Retour à Mon VIA",
    noAccount: "Aucun compte DeSo connecté",
    noAccountText: "Utilisez le bouton de compte VIA ci-dessus pour vous connecter avec DeSo Identity.",
    loading: "Chargement du portefeuille…",
    unavailable: "Le solde du portefeuille est temporairement indisponible.",
    stale: "Affichage des dernières données disponibles.",
    available: "Solde disponible",
    updated: "Dernière mise à jour",
    rate: "au taux de référence DESO actuel de VIA",
    creatorCoins: "creator coins",
    bought: "achetés",
    received: "reçus",
    balanceNote: "Les soldes sont lus directement depuis DeSo. VIA ne détient pas ces fonds ni ces coins.",
    boughtTitle: "Creator coins · Achetés",
    receivedTitle: "Creator coins · Reçus",
    emptyCoins: "Aucun creator coin dans cette catégorie.",
    publicKey: "Clé publique",
    copied: "Copié",
    copyKey: "Copier la clé publique",
    boundary: "Limites du portefeuille",
    boundaryText: "Cette page est volontairement en lecture seule. Les actions d’envoi, d’achat, de swap et de retrait ne sont pas proposées ici tant que chaque flux n’a pas été vérifié séparément avec l’approbation DeSo Identity.",
    coins: "coins",
  },
  Spanish: {
    title: "Mi Wallet",
    intro: "Información de wallet de solo lectura para la cuenta DeSo conectada actualmente a VIA.",
    back: "Volver a Mi VIA",
    noAccount: "No hay una cuenta DeSo conectada",
    noAccountText: "Usa el botón de cuenta VIA de arriba para iniciar sesión con DeSo Identity.",
    loading: "Cargando wallet…",
    unavailable: "El saldo del wallet no está disponible temporalmente.",
    stale: "Se muestran los últimos datos disponibles.",
    available: "Saldo disponible",
    updated: "Última actualización",
    rate: "al tipo de referencia DESO actual de VIA",
    creatorCoins: "creator coins",
    bought: "comprados",
    received: "recibidos",
    balanceNote: "Los saldos se leen directamente de DeSo. VIA no custodia estos fondos ni coins.",
    boughtTitle: "Creator coins · Comprados",
    receivedTitle: "Creator coins · Recibidos",
    emptyCoins: "No hay creator coins en esta categoría.",
    publicKey: "Clave pública",
    copied: "Copiado",
    copyKey: "Copiar clave pública",
    boundary: "Límite del wallet",
    boundaryText: "Esta página es deliberadamente de solo lectura. Enviar, comprar, intercambiar y retirar no se ofrecen aquí hasta que cada flujo de transacción se haya verificado por separado con la aprobación de DeSo Identity.",
    coins: "coins",
  },
  Chinese: {
    title: "我的钱包",
    intro: "当前连接到 VIA 的 DeSo 账户的只读钱包信息。",
    back: "返回我的 VIA",
    noAccount: "未连接 DeSo 账户",
    noAccountText: "请使用上方的 VIA 账户按钮通过 DeSo Identity 登录。",
    loading: "正在加载钱包…",
    unavailable: "钱包余额暂时不可用。",
    stale: "正在显示最近一次可用的钱包数据。",
    available: "可用余额",
    updated: "最后更新",
    rate: "按 VIA 当前 DESO 参考汇率",
    creatorCoins: "creator coins",
    bought: "已购买",
    received: "已接收",
    balanceNote: "余额直接从 DeSo 读取。VIA 不持有这些资金或 coins。",
    boughtTitle: "Creator coins · 已购买",
    receivedTitle: "Creator coins · 已接收",
    emptyCoins: "此类别中没有 creator coins。",
    publicKey: "公钥",
    copied: "已复制",
    copyKey: "复制公钥",
    boundary: "钱包边界",
    boundaryText: "此页面故意设置为只读。在每个交易流程分别通过 DeSo Identity 授权验证之前，这里不会开放发送、购买、交换或提现功能。",
    coins: "coins",
  },
  Hindi: {
    title: "My Wallet",
    intro: "Read-only wallet information for the DeSo account currently connected to VIA.",
    back: "Back to My VIA",
    noAccount: "No DeSo account connected",
    noAccountText: "Use the VIA account button above to log in with DeSo Identity.",
    loading: "Loading wallet…",
    unavailable: "Wallet balance is temporarily unavailable.",
    stale: "Showing the last available wallet data.",
    available: "Available balance",
    updated: "Last updated",
    rate: "at the current VIA DESO reference rate",
    creatorCoins: "creator coins",
    bought: "bought",
    received: "received",
    balanceNote: "Balances are read directly from DeSo. VIA does not hold these funds or coins.",
    boughtTitle: "Creator coins · Bought",
    receivedTitle: "Creator coins · Received",
    emptyCoins: "No creator coins in this category.",
    publicKey: "Public key",
    copied: "Copied",
    copyKey: "Copy public key",
    boundary: "Wallet boundary",
    boundaryText: "This page is deliberately read-only. Send, buy, swap and withdrawal actions are not exposed here until each transaction flow is separately verified with DeSo Identity approval.",
    coins: "coins",
  },
}

const quietAction = "inline-flex min-h-10 items-center rounded-[10px] border border-zinc-700/80 bg-transparent px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-[#8fd4a9]/50 hover:text-[#9adbb2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15"

function formatDeSo(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 9 }).format(value)
}

function formatCurrency(value: number, currency: "USD" | "EUR") {
  return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(value)
}

function CoinList({ title, holdings, emptyText, coinLabel }: { title: string; holdings: CreatorCoinHolding[]; emptyText: string; coinLabel: string }) {
  return (
    <section className="rounded-[16px] border border-zinc-800/80 bg-zinc-950/45 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium text-zinc-100">{title}</h2>
        <span className="rounded-full border border-zinc-800 px-2.5 py-1 text-xs text-zinc-500">{holdings.length}</span>
      </div>
      {holdings.length ? (
        <div className="mt-4 grid gap-2.5">
          {holdings.map((holding) => (
            <ViaAuraCompact
              key={`${title}-${holding.creatorPublicKey}`}
              publicKey={holding.creatorPublicKey}
              username={holding.username}
              profilePic={holding.profilePic}
              isVerified={holding.isVerified}
              valueLabel={`${formatDeSo(holding.balanceCoins)} ${coinLabel}`}
            />
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-zinc-500">{emptyText}</p>
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
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [language, setLanguage] = useState<ViaLanguage>("English")

  useEffect(() => {
    const restore = () => setSession(restoreIdentitySession())
    const syncLanguage = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    restore()
    syncLanguage()
    window.addEventListener(VIA_IDENTITY_EVENT, restore)
    window.addEventListener(VIA_SETTINGS_EVENT, syncLanguage)
    return () => {
      window.removeEventListener(VIA_IDENTITY_EVENT, restore)
      window.removeEventListener(VIA_SETTINGS_EVENT, syncLanguage)
    }
  }, [])

  useEffect(() => {
    if (!session?.publicKey) {
      setWallet(null)
      setLastUpdated(null)
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
        setLastUpdated(Date.now())
        setError("")
      } catch (reason) {
        if (active && !(reason instanceof DOMException && reason.name === "AbortError")) {
          setError(copies[language].unavailable)
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
  }, [session?.publicKey, language])

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

  const copy = copies[language]
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
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.25rem]">{copy.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">{copy.intro}</p>
          </div>
          <Link href="/my-via" className={quietAction}>{copy.back}</Link>
        </header>

        {!session ? (
          <section className="rounded-[16px] border border-zinc-800/80 bg-zinc-950/50 p-6">
            <h2 className="text-xl font-medium">{copy.noAccount}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{copy.noAccountText}</p>
          </section>
        ) : loading ? (
          <section className="rounded-[16px] border border-zinc-800/80 bg-zinc-950/50 p-6 text-sm text-zinc-400">{copy.loading}</section>
        ) : error && !wallet ? (
          <section className="rounded-[16px] border border-amber-900/40 bg-amber-950/10 p-6 text-sm text-amber-200">{error}</section>
        ) : wallet ? (
          <div className="grid gap-5">
            {error ? <section className="rounded-[14px] border border-amber-900/30 bg-amber-950/10 px-4 py-3 text-xs text-amber-200">{error} {copy.stale}</section> : null}
            <section className="rounded-[18px] border border-[#8fd4a9]/25 bg-zinc-950/55 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">{copy.available}</p>
                {lastUpdated ? <p className="text-xs text-zinc-500">{copy.updated} {new Date(lastUpdated).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p> : null}
              </div>
              <div className="mt-3 text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">{formatDeSo(wallet.balanceDeSo)} <span className="text-xl text-zinc-400">DESO</span></div>
              {balanceUsd !== null || balanceEur !== null ? (
                <p className="mt-2 text-sm font-medium text-zinc-400">
                  ≈ {[balanceUsd !== null ? formatCurrency(balanceUsd, "USD") : null, balanceEur !== null ? formatCurrency(balanceEur, "EUR") : null].filter(Boolean).join(" · ")} {copy.rate}
                </p>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-zinc-400">
                <span className="rounded-full border border-zinc-800 px-3 py-1.5">{wallet.creatorCoinHoldings.length} {copy.creatorCoins}</span>
                <span className="rounded-full border border-zinc-800 px-3 py-1.5">{bought.length} {copy.bought}</span>
                <span className="rounded-full border border-zinc-800 px-3 py-1.5">{received.length} {copy.received}</span>
              </div>
              <p className="mt-4 text-xs leading-5 text-zinc-500">{copy.balanceNote}</p>
            </section>

            <div className="grid gap-5 md:grid-cols-2">
              <CoinList title={copy.boughtTitle} holdings={bought} emptyText={copy.emptyCoins} coinLabel={copy.coins} />
              <CoinList title={copy.receivedTitle} holdings={received} emptyText={copy.emptyCoins} coinLabel={copy.coins} />
            </div>

            <section className="rounded-[16px] border border-zinc-800/80 bg-zinc-950/45 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-medium text-zinc-100">{copy.publicKey}</h2>
                <button type="button" onClick={() => void copyPublicKey()} className={quietAction}>{copied ? copy.copied : copy.copyKey}</button>
              </div>
              <p className="mt-3 break-all font-mono text-xs leading-6 text-zinc-400">{wallet.publicKey}</p>
            </section>

            <section className="rounded-[16px] border border-zinc-800/80 bg-zinc-950/45 p-6">
              <h2 className="text-lg font-medium text-zinc-100">{copy.boundary}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{copy.boundaryText}</p>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  )
}
