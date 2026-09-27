"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { restoreIdentitySession } from "../deso-identity-session"
import { fetchViaRates, type ViaRates } from "../via-live-rates"
import {
  readViaLocalSettings,
  saveViaLocalSettings,
  VIA_LANGUAGES,
  VIA_SETTINGS_EVENT,
  type ViaLanguage,
} from "../via-local-settings"

const flags: Record<ViaLanguage | "Hindi", string> = {
  Dutch: "🇳🇱", English: "🇬🇧", French: "🇫🇷", Spanish: "🇪🇸", Chinese: "🇨🇳", Hindi: "🇮🇳",
}

export default function NfViaTopbar() {
  const [language, setLanguage] = useState<ViaLanguage>("English")
  const [rates, setRates] = useState<ViaRates | null>(null)
  const [hasDeSo, setHasDeSo] = useState(false)

  useEffect(() => {
    const sync = () => {
      setLanguage(readViaLocalSettings().interfaceLanguage)
      setHasDeSo(Boolean(restoreIdentitySession()?.publicKey))
    }
    sync()
    window.addEventListener(VIA_SETTINGS_EVENT, sync)
    void fetchViaRates().then(setRates).catch(() => setRates(null))
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, sync)
  }, [])

  const usd = rates?.rates?.USD
  const eur = rates?.rates?.EUR

  return (
    <div className="nf-via-topbar" aria-label="NF.VIA controls">
      <Link href="/" className="nf-via-topbar-item nf-via-home">Home</Link>
      <div className="nf-via-topbar-item nf-via-rate" aria-label="DeSo price">
        <strong>DESO</strong>
        <span>{typeof usd === "number" ? `$${usd.toLocaleString(undefined, { maximumFractionDigits: 3 })}` : "—"}</span>
        <span className="nf-via-eur">{typeof eur === "number" ? `€${eur.toLocaleString(undefined, { maximumFractionDigits: 3 })}` : ""}</span>
      </div>
      <Link href="/wallet" className="nf-via-topbar-item nf-via-my-deso">
        My DESO{hasDeSo ? "" : " · Login"}
      </Link>
      <label className="nf-via-language">
        <span aria-hidden="true">{flags[language] ?? "🌐"}</span>
        <select
          aria-label="Language"
          value={language}
          onChange={(event) => saveViaLocalSettings({ interfaceLanguage: event.target.value as ViaLanguage })}
        >
          {VIA_LANGUAGES.map((item) => <option key={item} value={item}>{flags[item]} {item}</option>)}
        </select>
      </label>
      <style>{`
        .nf-via-topbar {
          width: min(1480px, calc(100% - 40px));
          min-height: 50px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          padding: 8px 0 0;
        }
        .nf-via-topbar-item, .nf-via-language {
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 6px 10px;
          border: 1px solid rgba(143,212,169,.18);
          border-radius: 10px;
          background: rgba(7,11,9,.72);
          color: #cbd5cf;
          text-decoration: none;
          font-size: 11px;
          white-space: nowrap;
        }
        .nf-via-home { margin-right: auto; }
        .nf-via-rate strong { color: #8fd4a9; font-size: 10px; }
        .nf-via-language select {
          max-width: 82px;
          border: 0;
          outline: 0;
          background: transparent;
          color: #d9e1dc;
          font: inherit;
        }
        @media (max-width: 720px) {
          .nf-via-topbar {
            width: calc(100% - 24px);
            gap: 5px;
            padding-top: 6px;
          }
          .nf-via-topbar-item, .nf-via-language {
            min-height: 36px;
            padding: 6px 8px;
            font-size: 10px;
          }
          .nf-via-eur { display: none; }
          .nf-via-language select {
            width: 34px;
            color: transparent;
          }
          .nf-via-language select option { color: initial; }
          .nf-via-my-deso { max-width: 88px; overflow: hidden; }
        }
      `}</style>
    </div>
  )
}
