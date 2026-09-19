"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "./via-local-settings"
import SponsorPlatform from "./sponsor-platform"

type Copy = { title: string; ideas: string; storage: string; support: string }

const copy: Record<ViaLanguage, Copy> = {
  Dutch: { title: "Ideeën & opslag", ideas: "Ideeënbus", storage: "Externe opslag", support: "Elke bijdrage telt — ook de kleinste." },
  English: { title: "Ideas & storage", ideas: "Ideas Box", storage: "External storage", support: "Every contribution counts — even the smallest." },
  French: { title: "Idées & stockage", ideas: "Boîte à idées", storage: "Stockage externe", support: "Chaque contribution compte — même la plus petite." },
  Spanish: { title: "Ideas y almacenamiento", ideas: "Buzón de ideas", storage: "Almacenamiento externo", support: "Cada contribución cuenta, incluso la más pequeña." },
  Chinese: { title: "想法与存储", ideas: "意见箱", storage: "外部存储", support: "每一份支持都很重要，即使是最小的一份。" },
}

const buttonStyle = {
  minHeight: "40px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 18px",
  border: "1px solid rgba(143,212,169,.44)",
  borderRadius: "999px",
  background: "rgba(4,18,10,.86)",
  color: "#b9ffd4",
  textDecoration: "none",
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: ".07em",
  textTransform: "uppercase" as const,
  whiteSpace: "nowrap" as const,
}

export default function ViaHomeCenterActions() {
  const [language, setLanguage] = useState<ViaLanguage>("English")

  useEffect(() => {
    const sync = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    sync()
    window.addEventListener(VIA_SETTINGS_EVENT, sync)
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, sync)
  }, [])

  const t = copy[language]

  return (
    <>
    <section
      aria-label="VIA ideas and storage"
      className="via-home-center-actions"
      style={{
        position: "absolute",
        zIndex: 5,
        top: "18px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(430px, calc(100vw - 650px))",
        minWidth: "320px",
        padding: "8px 10px 10px",
        border: "1px solid rgba(143,212,169,.24)",
        borderRadius: "18px",
        background: "rgba(3,12,7,.62)",
        backdropFilter: "blur(9px)",
        boxShadow: "0 0 20px rgba(82,177,118,.07)",
        textAlign: "center",
      }}
    >
      <span
        style={{
          display: "block",
          marginBottom: "7px",
          color: "#8fa89a",
          fontSize: "9px",
          fontWeight: 750,
          letterSpacing: ".11em",
          textTransform: "uppercase",
        }}
      >
        VIA · {t.title}
      </span>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <Link href="/ideas" style={buttonStyle}>{t.ideas}</Link>
        <Link href="/storage" style={{ ...buttonStyle, background: "rgba(3,12,7,.74)", color: "#9adbb2" }}>{t.storage}</Link>
      </div>
    </section>
    <section
      aria-label="Support VIA platform"
      style={{
        position: "absolute",
        zIndex: 5,
        left: "50%",
        top: "108px",
        transform: "translateX(-50%)",
        width: "min(430px, calc(100vw - 650px))",
        minWidth: "320px",
        display: "grid",
        justifyItems: "center",
        gap: "6px",
        padding: "10px 12px",
        border: "1px solid rgba(143,212,169,.18)",
        borderRadius: "16px",
        background: "rgba(3,12,7,.58)",
        backdropFilter: "blur(8px)",
      }}
    >
      <SponsorPlatform compact />
      <span style={{ color: "#9adbb2", fontSize: "10px", fontWeight: 700, textAlign: "center" }}>◆ {t.support}</span>
    </section>
      <style>{`\n        @media (max-width: 720px) {
          .via-home-center-actions, [aria-label="Support VIA platform"] {
            position: relative !important;
            top: auto !important;
            left: auto !important;
            transform: none !important;
            width: auto !important;
            min-width: 0 !important;
            margin: 10px 10px 0 !important;
          }
        }
      `}</style>
    </>
  )
}
