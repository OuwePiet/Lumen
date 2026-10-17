"use client"

import { useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react"
import type { ViaLanguage } from "./via-local-settings"
import { canShowViaRecognition } from "./via-recognition"

type Props = {
  verified?: boolean
  inactive?: boolean
  viaRecognized?: boolean
  compact?: boolean
  showLeaf?: boolean
  language?: ViaLanguage | "Hindi"
  className?: string
  interactive?: boolean
}

type MarkKind = "verified" | "inactive" | "via"

const COPY: Record<ViaLanguage | "Hindi", Record<MarkKind, { title: string; body: string }>> = {
  Dutch: {
    verified: {
      title: "DeSo Verified",
      body: "Originele DeSo-verificatie. VIA kan deze status niet toekennen, wijzigen of verwijderen.",
    },
    inactive: {
      title: "90+ dagen inactief",
      body: "Dit account heeft minstens 90 dagen geen aantoonbare openbare DeSo-activiteit gehad. VIA baseert dit alleen op openbare DeSo-data.",
    },
    via: {
      title: "VIA-erkenning",
      body: "Verdiend door aantoonbare positieve betrokkenheid bij VIA volgens vaste VIA-criteria. Deze erkenning is niet te koop.",
    },
  },
  English: {
    verified: {
      title: "DeSo Verified",
      body: "Original DeSo verification. VIA cannot grant, change or remove this status.",
    },
    inactive: {
      title: "Inactive 90+ days",
      body: "This account has had no verifiable public DeSo activity for at least 90 days. VIA uses public DeSo data only.",
    },
    via: {
      title: "VIA Recognition",
      body: "Earned through verifiable positive participation in VIA under fixed VIA criteria. This recognition cannot be bought.",
    },
  },
  French: {
    verified: {
      title: "Vérifié par DeSo",
      body: "Vérification DeSo d'origine. VIA ne peut ni attribuer, ni modifier, ni supprimer ce statut.",
    },
    inactive: {
      title: "Inactif depuis 90+ jours",
      body: "Ce compte n'a eu aucune activité DeSo publique vérifiable depuis au moins 90 jours. VIA utilise uniquement les données publiques DeSo.",
    },
    via: {
      title: "Reconnaissance VIA",
      body: "Obtenue grâce à une participation positive et vérifiable à VIA selon des critères VIA fixes. Elle ne peut pas être achetée.",
    },
  },
  Spanish: {
    verified: {
      title: "Verificado por DeSo",
      body: "Verificación original de DeSo. VIA no puede conceder, cambiar ni eliminar este estado.",
    },
    inactive: {
      title: "Inactivo 90+ días",
      body: "Esta cuenta no ha tenido actividad pública verificable en DeSo durante al menos 90 días. VIA solo usa datos públicos de DeSo.",
    },
    via: {
      title: "Reconocimiento VIA",
      body: "Se obtiene mediante una participación positiva y verificable en VIA según criterios fijos de VIA. No se puede comprar.",
    },
  },
  Hindi: {
    verified: { title: "DeSo सत्यापित", body: "मूल DeSo सत्यापन। VIA इस स्थिति को प्रदान, बदल या हटा नहीं सकता।" },
    inactive: { title: "90+ दिनों से निष्क्रिय", body: "इस खाते में कम से कम 90 दिनों से सत्यापित सार्वजनिक DeSo गतिविधि नहीं हुई है। VIA केवल सार्वजनिक DeSo डेटा का उपयोग करता है।" },
    via: { title: "VIA मान्यता", body: "निश्चित VIA मानदंडों के अनुसार VIA में सत्यापित सकारात्मक भागीदारी से अर्जित। यह मान्यता खरीदी नहीं जा सकती।" },
  },
  Chinese: {
    verified: {
      title: "DeSo 已验证",
      body: "这是 DeSo 原始验证状态。VIA 不能授予、更改或移除此状态。",
    },
    inactive: {
      title: "90+ 天未活跃",
      body: "该账户至少 90 天没有可验证的公开 DeSo 活动。VIA 仅使用公开 DeSo 数据。",
    },
    via: {
      title: "VIA 认可",
      body: "根据固定的 VIA 标准，通过可验证的积极参与获得。此认可不可购买。",
    },
  },
}

const wrap: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  flex: "0 0 auto",
}

function MarkShell({
  kind,
  compact,
  language,
  children,
  interactive,
}: {
  kind: MarkKind
  compact: boolean
  language: ViaLanguage | "Hindi"
  children: React.ReactNode
  interactive: boolean
}) {
  const [open, setOpen] = useState(false)
  const text = COPY[language][kind]

  function toggle(event: MouseEvent<HTMLSpanElement>) {
    event.preventDefault()
    event.stopPropagation()
    setOpen((value) => !value)
  }

  function keyboard(event: KeyboardEvent<HTMLSpanElement>) {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    event.stopPropagation()
    setOpen((value) => !value)
  }

  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <span
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-expanded={interactive ? open : undefined}
        aria-label={`${text.title}. ${text.body}`}
        title={text.title}
        onClick={interactive ? toggle : undefined}
        onKeyDown={interactive ? keyboard : undefined}
        style={{ display: "inline-flex", cursor: "help", outline: "none" }}
      >
        {children}
      </span>
      {open ? (
        <span
          role="status"
          onClick={(event) => { event.preventDefault(); event.stopPropagation() }}
          style={{
            position: "absolute",
            zIndex: 240,
            top: compact ? "24px" : "29px",
            left: "50%",
            transform: "translateX(-50%)",
            width: compact ? "230px" : "260px",
            padding: "10px 11px",
            borderRadius: "12px",
            border: "1px solid rgba(143,212,169,.24)",
            background: "rgba(4,11,7,.97)",
            boxShadow: "0 14px 40px rgba(0,0,0,.46), inset 0 1px 0 rgba(255,255,255,.04)",
            color: "#cbd7cf",
            fontSize: "11px",
            lineHeight: 1.45,
            whiteSpace: "normal",
            textAlign: "left",
          }}
        >
          <strong style={{ display: "block", marginBottom: "3px", color: "#eef4f0", fontSize: "11px" }}>{text.title}</strong>
          {text.body}
        </span>
      ) : null}
    </span>
  )
}

function CheckMark({ inactive, compact }: { inactive: boolean; compact: boolean }) {
  return (
      <svg width={compact ? 16 : 20} height={compact ? 16 : 20} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.77 4 4 0 0 1 0 6.76 4 4 0 0 1-4.77 4.77 4 4 0 0 1-6.76 0 4 4 0 0 1-4.77-4.77 4 4 0 0 1 0-6.76Z" fill={inactive ? "#78837e" : "#3898ec"} />
        <path d="m8 12 2.6 2.6L16.1 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
  )
}

function ViaLeaf({ compact }: { compact: boolean }) {
  const size = compact ? 18 : 22
  return (
    <span
      style={{
        width: size,
        height: size,
        display: "inline-grid",
        placeItems: "center",
        borderRadius: "50%",
        border: "1px solid rgba(143,212,169,.28)",
        background: "rgba(8,18,12,.72)",
        boxShadow: "0 0 12px rgba(143,212,169,.10), inset 0 1px 0 rgba(255,255,255,.05)",
        overflow: "hidden",
      }}
    >
      <img
        src="/via-leaf.svg"
        alt=""
        aria-hidden="true"
        style={{ width: compact ? "15px" : "19px", height: compact ? "14px" : "18px", objectFit: "contain", display: "block" }}
      />
    </span>
  )
}

export default function ViaIdentityStatusMarks({
  verified = false,
  inactive = false,
  viaRecognized = false,
  compact = true,
  showLeaf = true,
  language = "English",
  className,
  interactive = true,
}: Props) {
  return (
    <span className={className} style={wrap}>
      {verified ? (
        <MarkShell kind="verified" compact={compact} language={language} interactive={interactive}>
          <CheckMark inactive={false} compact={compact} />
        </MarkShell>
      ) : null}
      {inactive ? (
        <MarkShell kind="inactive" compact={compact} language={language} interactive={interactive}>
          <CheckMark inactive compact={compact} />
        </MarkShell>
      ) : null}
      {showLeaf && canShowViaRecognition(viaRecognized) ? (
        <MarkShell kind="via" compact={compact} language={language} interactive={interactive}>
          <ViaLeaf compact={compact} />
        </MarkShell>
      ) : null}
    </span>
  )
}
