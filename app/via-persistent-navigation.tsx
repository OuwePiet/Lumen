"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import ViaHomeControls from "./via-home-controls"
import { useViaIdentitySession } from "./use-via-identity-session"
import { useEffect, useState, type ReactNode } from "react"

const community = /^\/(social|notifications|messages|discover|saved|profile|wallet|collection|market|nft|studio|my-via|communities|edit-post|show-your-stuff|settings|owner|payments|payment-info|payment-status|payment-readiness|quest|live|world|radio|music|help|advertising|ideas|storage|events|learn|more|news|read|wereldkalender|wereldspiegel|mijn-agenda|public|via-panels|transparency)(\/|$)/

export default function ViaPersistentNavigation({ children }: { children: ReactNode }) {
  const path = usePathname()
  const home = path === "/"
  const session = useViaIdentitySession()
  const privateCalendar = /^\/(wereldkalender|mijn-agenda)(\/|$)/.test(path)
  const newspaper = /^\/wereldspiegel(?:-proef)?(\/|$)/.test(path)
  const shared = community.test(path) || newspaper
  const [open, setOpen] = useState(false)
  useEffect(() => { setOpen(false) }, [path])
  useEffect(() => { const close = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }; window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close) }, [])
  return <div className={home ? "via-shell-home" : shared ? (newspaper ? "via-shell-newspaper" : "via-shell-community") : "via-shell-public"}>
    {!home && shared && <button type="button" className="via-shell-menu-trigger" aria-expanded={open} aria-controls="via-shared-menu" onClick={() => setOpen(!open)}>☰ Menu</button>}
    {!home && shared && open && <button type="button" className="via-shell-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />}
    <div id="via-shared-menu" className="via-shell-navigation" hidden={!home && (!shared || !open)} onClick={(e) => { if (!home && (e.target as HTMLElement).closest("a[href]")) setOpen(false) }}>{!home && <button type="button" className="via-shell-close" aria-label="Close menu" onClick={() => setOpen(false)}>×</button>}{!home && <Link href="/" className="via-shell-home-link">⌂ Homepage</Link>}<ViaHomeControls /></div>
    <div className="via-shell-content">{privateCalendar && !session ? <section style={{padding:24}}><p>Sign in with DeSo on the VIA homepage to open your calendar.</p><a href="/">Homepage</a></section> : privateCalendar ? <div key={session?.publicKey}>{children}</div> : children}</div>
    <style>{`
      .via-shell-home { position:relative; background:#000; }
      .via-shell-home > .via-shell-navigation { position:absolute; inset:0; pointer-events:none; z-index:5; }
      .via-shell-home .via-home-controls { pointer-events:auto; }
      body:has(.via-shell-home) > header { display:none !important; }
      .via-shell-community { display:block; }
      .via-shell-community > .via-shell-navigation, .via-shell-newspaper > .via-shell-navigation { position:fixed; inset:0 auto 0 0; width:min(320px,90vw); z-index:1002; max-height:100dvh; overflow:auto; background:#102019; box-shadow:0 0 24px #0008; }
      .via-shell-community .via-home-controls, .via-shell-newspaper .via-home-controls { position:relative !important; inset:auto !important; width:auto !important; margin:8px !important; overflow:visible !important; }
      .via-shell-content { min-width:0; }
      .via-shell-menu-trigger { position:fixed; top:8px; left:8px; z-index:1000; padding:8px 12px; border:1px solid #709980; border-radius:8px; background:#102019; color:white; }
      .via-shell-home-link { display:block; margin:8px 52px 8px 8px; padding:8px 12px; border:1px solid #709980; border-radius:8px; color:#fff; background:#102019; text-align:center; font-weight:600; }
      .via-shell-close { position:sticky; top:4px; float:right; z-index:6; width:36px; height:36px; background:#102019; color:white; border:1px solid #709980; border-radius:8px; }
      .via-shell-backdrop { position:fixed; inset:0; z-index:1001; background:#0008; border:0; }
      body:has(.via-shell-community) .via-site-header-brand { visibility:hidden; }
      body:has(.via-shell-community) .via-site-header-language-wrap, body:has(.via-shell-community) .via-site-header-utility[href="/wallet"] { display:none !important; }
      body:has(.via-shell-community) .via-site-header:not(.via-calendar-header) .via-site-header-shell { display:flex !important; width:100% !important; min-height:56px !important; height:auto !important; max-height:none !important; padding:4px 12px 4px 108px !important; align-items:center !important; overflow:visible !important; }
      body:has(.via-shell-community) .via-site-header:not(.via-calendar-header) :is(.via-site-header-brand,.via-site-header-top,.via-global-guides,.via-mobile-social-bar,.via-mobile-drawer-trigger,.via-notifications-future-mark) { display:none !important; }
      body:has(.via-shell-community) .via-site-header:not(.via-calendar-header) .via-site-header-tools { display:flex !important; position:relative !important; inset:auto !important; width:auto !important; max-width:100% !important; height:auto !important; padding:0 !important; border:0 !important; justify-content:flex-start !important; overflow:visible !important; flex-wrap:wrap !important; }
      body:has(.via-shell-community) .via-site-header:not(.via-calendar-header) .via-site-header-tools .via-notifications-top-control { display:block !important; }
      body:has(.via-shell-community) .via-site-header:not(.via-calendar-header) .via-site-header-tools .via-site-header-search { display:flex !important; }
      .via-shell-community .via-home-grid-account-wrap { min-width:0; }
      .via-shell-community .via-home-grid-account-wrap > button { padding-inline:4px !important; gap:3px !important; }
      body:has(.via-shell-community):not(:has(.via-site-header:not(.via-calendar-header))) .via-shell-content { padding-top:48px; }
      @media(max-width:720px) { body:has(.via-shell-community) .via-site-header:not(.via-calendar-header) .via-site-header-tools { flex-wrap:nowrap !important; gap:4px !important; } body:has(.via-shell-community) .via-site-header:not(.via-calendar-header) .via-site-header-search { min-width:44px !important; width:44px !important; padding:0 !important; justify-content:center !important; } body:has(.via-shell-community) .via-site-header-search-label, body:has(.via-shell-community) .via-notifications-top-label { display:none !important; } }
      .via-shell-navigation[hidden] { display:none !important; }
      body:has(.via-shell-community) .via-site-header-account-wrap, body:has(.via-shell-community) .via-site-header-nav { display:none !important; }
      @media(max-width:1366px) { .via-shell-home > .via-shell-navigation { position:relative; inset:auto; } }
      @media(max-width:720px) { .via-shell-community { display:block; }  body:has(.via-shell-community) .via-mobile-drawer-trigger { display:none !important; } }
    `}</style>
  </div>
}
