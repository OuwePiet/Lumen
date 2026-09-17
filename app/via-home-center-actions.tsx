"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "./via-local-settings"

type Copy = { title: string; body: string; ideas: string; storage: string }

const copy: Record<ViaLanguage, Copy> = {
  Dutch: { title: "Heb je een idee voor VIA?", body: "Mis je iets, kan iets beter of heb je een nieuw voorstel? Deel het via de Ideeënbus.", ideas: "Ideeënbus", storage: "Externe opslag" },
  English: { title: "Have an idea for VIA?", body: "Missing something, see an improvement, or have a new proposal? Share it through the Ideas Box.", ideas: "Ideas Box", storage: "External storage" },
  French: { title: "Une idée pour VIA ?", body: "Il manque quelque chose, une amélioration est possible ou vous avez une nouvelle proposition ? Partagez-la via la boîte à idées.", ideas: "Boîte à idées", storage: "Stockage externe" },
  Spanish: { title: "¿Tienes una idea para VIA?", body: "¿Falta algo, puede mejorarse o tienes una nueva propuesta? Compártela en el buzón de ideas.", ideas: "Buzón de ideas", storage: "Almacenamiento externo" },
  Chinese: { title: "对 VIA 有想法吗？", body: "缺少什么、哪里可以改进，或有新的建议？请通过意见箱告诉我们。", ideas: "意见箱", storage: "外部存储" },
}

const buttonStyle = {
  minHeight: "42px",
  width: "100%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "9px 18px",
  border: "1px solid rgba(143,212,169,.42)",
  borderRadius: "999px",
  background: "rgba(4,18,10,.88)",
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
    <section
      aria-label="VIA ideas and storage"
      style={{
        position: "absolute",
        zIndex: 5,
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(350px, calc(100vw - 640px))",
        minWidth: "280px",
        padding: "13px 15px 14px",
        border: "1px solid rgba(143,212,169,.34)",
        borderRadius: "17px",
        background: "rgba(3,12,7,.80)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 0 28px rgba(82,177,118,.10)",
        textAlign: "center",
      }}
    >
      <strong style={{ display: "block", color: "#dce8e0", fontSize: "12px", fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase" }}>{t.title}</strong>
      <span style={{ display: "block", marginTop: "5px", color: "#94a59b", fontSize: "10px", lineHeight: 1.45 }}>{t.body}</span>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px", marginTop: "10px" }}>
        <Link href="/ideas" style={buttonStyle}>{t.ideas}</Link>
        <Link href="/storage" style={{ ...buttonStyle, background: "rgba(3,12,7,.72)", color: "#9adbb2" }}>{t.storage}</Link>
      </div>
    </section>
  )
}
