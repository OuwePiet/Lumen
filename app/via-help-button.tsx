"use client"

import Link from "next/link"
import { CircleHelp } from "lucide-react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "./via-local-settings"

const COPY: Record<ViaLanguage | "Hindi", string> = {
  Dutch: "Handleiding",
  English: "Guide",
  French: "Guide",
  Spanish: "Guía",
  Chinese: "指南",
  Hindi: "मार्गदर्शिका",
}

export default function ViaHelpButton() {
  const pathname = usePathname()
  const [language, setLanguage] = useState<ViaLanguage>("English")

  useEffect(() => {
    const sync = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    sync()
    window.addEventListener(VIA_SETTINGS_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(VIA_SETTINGS_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  const label = COPY[language]

  return (
    <Link
      href="/help"
      aria-label={label}
      title={label}
      className={`via-help-button ${pathname === "/" || pathname === "/radio" || pathname === "/notifications" || pathname === "/messages" ? "via-help-button-compact-hidden" : ""} fixed bottom-3 left-3 z-[80] inline-flex min-h-10 items-center gap-2 rounded-full border border-[#285f40] bg-[#07100b]/95 px-3 py-2 text-xs font-semibold text-[#b8ddc5] shadow-xl backdrop-blur transition hover:border-[#8fd4a9]/70 hover:text-white`}
    >
      <CircleHelp className="h-4 w-4" aria-hidden="true" />
      <span className="via-help-label">{label}</span>
      <style>{`
        @media (max-width: 720px) {
          .via-help-button {
            left: 10px !important;
            bottom: calc(env(safe-area-inset-bottom) + 10px) !important;
            width: 44px !important;
            height: 44px !important;
            min-height: 44px !important;
            padding: 0 !important;
            justify-content: center !important;
          }
          .via-help-label { display: none !important; }
          .via-help-button-compact-hidden { display: none !important; }
        }
      `}</style>
    </Link>
  )
}
