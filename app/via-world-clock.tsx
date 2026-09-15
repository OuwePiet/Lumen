"use client"

import { useEffect, useMemo, useState } from "react"
import { restoreIdentitySession, VIA_IDENTITY_EVENT, type ViaIdentitySession } from "./deso-identity-session"
import { fetchViaRates, isViaRateStale, VIA_RATE_REFRESH_MS, type ViaRates } from "./via-live-rates"

const zones = [
  { label: "New York", timeZone: "America/New_York" },
  { label: "London", timeZone: "Europe/London" },
  { label: "Amsterdam", timeZone: "Europe/Amsterdam" },
  { label: "Tokyo", timeZone: "Asia/Tokyo" },
  { label: "Los Angeles", timeZone: "America/Los_Angeles" },
] as const

type WalletResponse = {
  ok?: boolean
  wallet?: {
    balanceDeSo?: number
  }
}

function formatTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
}

export default function ViaWorldClock() {
  const [now, setNow] = useState(() => new Date())
  const [rates, setRates] = useState<ViaRates | null>(null)
  const [rateUnavailable, setRateUnavailable] = useState(false)
  const [session, setSession] = useState<ViaIdentitySession | null>(null)
  const [balanceDeSo, setBalanceDeSo] = useState<number | null>(null)
  const [walletUnavailable, setWalletUnavailable] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let active = true
    let controller: AbortController | null = null

    const refresh = async () => {
      controller?.abort()
      controller = new AbortController()
      try {
        const next = await fetchViaRates(controller.signal)
        if (active) {
          setRates(next)
          setRateUnavailable(false)
        }
      } catch (error) {
        if (active && !(error instanceof DOMException && error.name === "AbortError")) {
          setRateUnavailable(true)
        }
      }
    }

    void refresh()
    const timer = window.setInterval(refresh, VIA_RATE_REFRESH_MS)
    return () => {
      active = false
      controller?.abort()
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    setSession(restoreIdentitySession())

    function handleIdentitySession(event: Event) {
      const detail = event instanceof CustomEvent ? event.detail : undefined
      if (detail && typeof detail.publicKey === "string") {
        setSession(detail as ViaIdentitySession)
      } else {
        setSession(restoreIdentitySession())
      }
    }

    window.addEventListener(VIA_IDENTITY_EVENT, handleIdentitySession)
    window.addEventListener("storage", handleIdentitySession)
    return () => {
      window.removeEventListener(VIA_IDENTITY_EVENT, handleIdentitySession)
      window.removeEventListener("storage", handleIdentitySession)
    }
  }, [])

  useEffect(() => {
    if (!session?.publicKey) {
      setBalanceDeSo(null)
      setWalletUnavailable(false)
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
          headers: { Accept: "application/json" },
          signal: controller.signal,
        })
        const data = (await response.json()) as WalletResponse
        const nextBalance = data.wallet?.balanceDeSo
        if (!response.ok || !data.ok || typeof nextBalance !== "number" || !Number.isFinite(nextBalance)) {
          throw new Error("Wallet balance unavailable")
        }
        if (active) {
          setBalanceDeSo(nextBalance)
          setWalletUnavailable(false)
        }
      } catch (error) {
        if (active && !(error instanceof DOMException && error.name === "AbortError")) {
          setBalanceDeSo(null)
          setWalletUnavailable(true)
        }
      }
    }

    void refreshWallet()
    const timer = window.setInterval(refreshWallet, 60_000)
    return () => {
      active = false
      controller?.abort()
      window.clearInterval(timer)
    }
  }, [session?.publicKey])

  const clocks = useMemo(
    () => zones.map((zone) => ({ ...zone, time: formatTime(now, zone.timeZone) })),
    [now],
  )
  const stale = rates ? isViaRateStale(rates.checkedAt, now.getTime()) : false
  const usd = rates?.rates && !stale && !rateUnavailable ? rates.rates.USD : null
  const yourDeso = session?.publicKey && !walletUnavailable && balanceDeSo !== null
    ? balanceDeSo.toLocaleString(undefined, { maximumFractionDigits: 4 })
    : "—"

  return (
    <section
      aria-label="NASA Earth credit, world clock, live DESO price and signed-in DESO balance"
      style={{
        position: "relative",
        zIndex: 2,
        width: "min(1480px, calc(100% - 32px))",
        margin: "24px auto 0",
        paddingTop: "12px",
        borderTop: "1px solid rgba(79,116,98,.2)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "10px 18px",
        color: "#9aa8a0",
        fontSize: "11px",
        letterSpacing: ".02em",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}>
        <img src="/nasa-credit.svg" alt="NASA" style={{ width: "58px", height: "22px", objectFit: "contain" }} />
        <span style={{ color: "#77847c" }}>Earth imagery/video: NASA</span>
      </span>

      <span style={{ color: "#8fd4a9", fontWeight: 750, letterSpacing: ".1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
        World Clock
      </span>

      {clocks.map((clock) => (
        <span key={clock.timeZone} style={{ whiteSpace: "nowrap" }}>
          <span style={{ color: "#6e7f76" }}>{clock.label}</span>{" "}
          <strong style={{ color: "#c8d1cc", fontWeight: 600 }}>{clock.time}</strong>
        </span>
      ))}

      <span
        style={{ whiteSpace: "nowrap" }}
        title={stale ? "DESO rate is stale" : rateUnavailable ? "DESO rate is temporarily unavailable" : "Current DESO reference price in USD"}
      >
        <span style={{ color: "#6e7f76" }}>$DESO</span>{" "}
        <strong style={{ color: usd === null ? "#7f8b85" : "#9adbb2", fontWeight: 700 }}>
          {usd === null ? "—" : `$${usd.toLocaleString(undefined, { maximumFractionDigits: 4 })}`}
        </strong>
      </span>

      <span
        style={{ whiteSpace: "nowrap" }}
        title={!session ? "Log in with DeSo to show your balance" : walletUnavailable ? "Your DESO balance is temporarily unavailable" : "DESO balance for the currently signed-in account"}
      >
        <span style={{ color: "#6e7f76" }}>Your DESO</span>{" "}
        <strong style={{ color: yourDeso === "—" ? "#7f8b85" : "#f1f5f2", fontWeight: 700 }}>{yourDeso}</strong>
      </span>
    </section>
  )
}
