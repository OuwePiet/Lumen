"use client"
import { usePathname } from "next/navigation"
import ViaHomeControls from "./via-home-controls"
import type { ReactNode } from "react"

const community = /^\/(social|notifications|messages|discover|saved|profile|wallet|collection|market|nft|studio|my-via|communities|edit-post|show-your-stuff|settings|owner|payments|payment-info|payment-status|payment-readiness)(\/|$)/

export default function ViaPersistentNavigation({ children }: { children: ReactNode }) {
  const path = usePathname()
  const home = path === "/"
  const shared = community.test(path)
  return <div className={home ? "via-shell-home" : shared ? "via-shell-community" : "via-shell-public"}>
    <div className="via-shell-navigation" hidden={!home && !shared}><ViaHomeControls /></div>
    <div className="via-shell-content">{children}</div>
    <style>{`
      .via-shell-home { position:relative; background:#000; }
      .via-shell-home > .via-shell-navigation { position:absolute; inset:0; pointer-events:none; z-index:5; }
      .via-shell-home .via-home-controls { pointer-events:auto; }
      body:has(.via-shell-home) > header { display:none !important; }
      .via-shell-community { display:grid; grid-template-columns:260px minmax(0,1fr); align-items:start; }
      .via-shell-community > .via-shell-navigation { position:sticky; top:0; max-height:100dvh; overflow:auto; }
      .via-shell-community .via-home-controls { position:relative !important; inset:auto !important; width:auto !important; margin:8px !important; overflow:visible !important; }
      .via-shell-content { min-width:0; }
      .via-shell-navigation[hidden] { display:none !important; }
      body:has(.via-shell-community) .via-site-header-account-wrap, body:has(.via-shell-community) .via-site-header-nav { display:none !important; }
      @media(max-width:1366px) { .via-shell-home > .via-shell-navigation { position:relative; inset:auto; } }
      @media(max-width:720px) { .via-shell-community { display:block; } .via-shell-community > .via-shell-navigation { position:relative; max-height:none; } body:has(.via-shell-community) .via-mobile-drawer-trigger { display:none !important; } }
    `}</style>
  </div>
}