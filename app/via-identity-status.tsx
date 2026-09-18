"use client"

import { useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react"
import type { ViaLanguage } from "./via-local-settings"

type Props = {
  verified?: boolean
  inactive?: boolean
  viaRecognized?: boolean
  compact?: boolean
  showLeaf?: boolean
  language?: ViaLanguage
  className?: string
}

type MarkKind = "verified" | "inactive" | "via"

const COPY: Record<ViaLanguage, Record<MarkKind, { title: string; body: string }>> = {
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
}: {
  kind: MarkKind
  compact: boolean
  language: ViaLanguage
  children: React.ReactNode
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
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-label={`${text.title}. ${text.body}`}
        title={text.title}
        onClick={toggle}
        onKeyDown={keyboard}
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
  const size = compact ? 17 : 21
  const background = inactive
    ? "linear-gradient(145deg, #8a918d, #545c58)"
    : "linear-gradient(145deg, #51b8ff, #2386e8)"
  const shadow = inactive
    ? "0 0 0 1px rgba(210,220,214,.16), inset 0 1px 0 rgba(255,255,255,.16)"
    : "0 0 14px rgba(55,157,255,.30), 0 0 0 1px rgba(167,220,255,.24), inset 0 1px 0 rgba(255,255,255,.28)"

  return (
    <span
      style={{
        width: size,
        height: size,
        display: "inline-grid",
        placeItems: "center",
        borderRadius: "50%",
        background,
        boxShadow: shadow,
      }}
    >
      <svg width={compact ? 10 : 12} height={compact ? 10 : 12} viewBox="0 0 16 16" aria-hidden="true">
        <path d="M3.2 8.3 6.4 11.2 12.8 4.8" fill="none" stroke={inactive ? "#202824" : "#fff"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
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
        border: "1px solid rgba(143,212,169,.38)",
        background: "radial-gradient(circle at 35% 30%, rgba(143,212,169,.24), rgba(9,24,15,.82) 65%)",
        boxShadow: "0 0 12px rgba(143,212,169,.12), inset 0 1px 0 rgba(255,255,255,.06)",
      }}
    >
      <svg width={compact ? 12 : 15} height={compact ? 12 : 15} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19.7 3.7C12.8 4.4 7.6 7 5.1 11.2c-1.8 3-1.3 6.5.7 8.8 1.1-4.2 4-7.7 8.6-10.2-3.2 2.8-5.4 6-6.3 9.7 3.2.4 6.5-1 8.5-3.6 2.5-3.3 2.5-7.6 3.1-12.2Z" fill="#9FE3B8" />
      </svg>
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
}: Props) {
  return (
    <span className={className} style={wrap}>
      {verified ? (
        <MarkShell kind="verified" compact={compact} language={language}>
          <CheckMark inactive={false} compact={compact} />
        </MarkShell>
      ) : null}
      {inactive ? (
        <MarkShell kind="inactive" compact={compact} language={language}>
          <CheckMark inactive compact={compact} />
        </MarkShell>
      ) : null}
      {showLeaf && viaRecognized ? (
        <MarkShell kind="via" compact={compact} language={language}>
          <ViaLeaf compact={compact} />
        </MarkShell>
      ) : null}
    </span>
  )
}
