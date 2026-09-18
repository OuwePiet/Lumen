"use client"

import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

const categories = ["NFT", "Social", "Music", "VIA LIVE", "Games", "Discovery", "Safety", "Accessibility", "Other"] as const
type Category = (typeof categories)[number]
type SubmitState = "idle" | "sending" | "sent" | "local" | "rate" | "error"

type IdeasCopy = {
  kicker: string
  title: string
  intro: string
  whatHappens: string
  process: string
  safety: string
  category: string
  idea: string
  placeholder: string
  send: string
  sending: string
  sent: string
  local: string
  rate: string
  error: string
  back: string
  statuses: [string, string, string, string, string, string]
  categories: Record<Category, string>
}

const COPY: Record<ViaLanguage, IdeasCopy> = {
  Dutch: {
    kicker: "VIA · IDEEËNBUS",
    title: "Help VIA vooruit.",
    intro: "VIA wordt gebouwd voor en met zijn bezoekers. Deel wat je mist, wat beter kan werken of wat je graag zou willen beleven, maken of ontdekken.",
    whatHappens: "Wat gebeurt er met je idee?",
    process: "We bekijken ideeën samen met behoeften van bezoekers en wat technisch veilig, praktisch en betaalbaar is. Een idee kan deze stappen doorlopen:",
    safety: "Deel nooit wachtwoorden, DeSo seed words, private keys of andere vertrouwelijke informatie. VIA probeert je idee eerst naar de beveiligde centrale inbox te sturen. Als centrale opslag tijdelijk niet beschikbaar is, wordt het idee alleen op dit apparaat opgeslagen.",
    category: "Categorie",
    idea: "Jouw idee",
    placeholder: "Vertel ons wat VIA beter, nuttiger of leuker kan maken…",
    send: "Verstuur mijn idee",
    sending: "Versturen…",
    sent: "Ontvangen door VIA. Dank je.",
    local: "Centrale ontvangst is nog niet beschikbaar. Je idee is veilig op dit apparaat opgeslagen.",
    rate: "Wacht ongeveer een minuut voordat je nog een idee verstuurt.",
    error: "Het idee kon nu niet worden opgeslagen. Probeer het later opnieuw.",
    back: "Terug naar VIA",
    statuses: ["Ontvangen", "Bekeken", "Onderzoeken", "Gepland", "In ontwikkeling", "Gebouwd"],
    categories: { NFT: "NFT", Social: "Sociaal", Music: "Muziek", "VIA LIVE": "VIA LIVE", Games: "Spellen", Discovery: "Ontdekken", Safety: "Veiligheid", Accessibility: "Toegankelijkheid", Other: "Overig" },
  },
  English: {
    kicker: "VIA · IDEA BOX",
    title: "Help VIA move forward.",
    intro: "VIA is built for and with its visitors. Share what you miss, what could work better, or what you would like to experience, create or discover.",
    whatHappens: "What happens to your idea?",
    process: "We review ideas alongside visitor needs and what is technically safe, practical and affordable. An idea can move through:",
    safety: "Never share passwords, DeSo seed words, private keys or other confidential information. VIA first tries to send your idea to the secure central inbox. If central storage is temporarily unavailable, the idea is saved only on this device instead.",
    category: "Category",
    idea: "Your idea",
    placeholder: "Tell us what could make VIA better, more useful or more enjoyable…",
    send: "Send my idea",
    sending: "Sending…",
    sent: "Received by VIA. Thank you.",
    local: "Central intake is not available yet. Your idea was saved safely on this device.",
    rate: "Please wait about a minute before sending another idea.",
    error: "The idea could not be saved right now. Please try again later.",
    back: "Back to VIA",
    statuses: ["Received", "Reviewed", "Exploring", "Planned", "In development", "Built"],
    categories: { NFT: "NFT", Social: "Social", Music: "Music", "VIA LIVE": "VIA LIVE", Games: "Games", Discovery: "Discovery", Safety: "Safety", Accessibility: "Accessibility", Other: "Other" },
  },
  French: {
    kicker: "VIA · BOÎTE À IDÉES",
    title: "Aidez VIA à avancer.",
    intro: "VIA est construit pour et avec ses visiteurs. Partagez ce qui vous manque, ce qui pourrait mieux fonctionner ou ce que vous aimeriez vivre, créer ou découvrir.",
    whatHappens: "Que devient votre idée ?",
    process: "Nous examinons les idées selon les besoins des visiteurs et ce qui est techniquement sûr, pratique et abordable. Une idée peut passer par :",
    safety: "Ne partagez jamais de mots de passe, seed words DeSo, clés privées ou autres informations confidentielles. VIA essaie d'abord d'envoyer votre idée vers la boîte centrale sécurisée. Si le stockage central est temporairement indisponible, l'idée est enregistrée uniquement sur cet appareil.",
    category: "Catégorie",
    idea: "Votre idée",
    placeholder: "Dites-nous ce qui pourrait rendre VIA meilleur, plus utile ou plus agréable…",
    send: "Envoyer mon idée",
    sending: "Envoi…",
    sent: "Reçu par VIA. Merci.",
    local: "La réception centrale n'est pas encore disponible. Votre idée a été enregistrée en sécurité sur cet appareil.",
    rate: "Attendez environ une minute avant d'envoyer une autre idée.",
    error: "L'idée n'a pas pu être enregistrée. Réessayez plus tard.",
    back: "Retour à VIA",
    statuses: ["Reçue", "Examinée", "Exploration", "Planifiée", "En développement", "Construite"],
    categories: { NFT: "NFT", Social: "Social", Music: "Musique", "VIA LIVE": "VIA LIVE", Games: "Jeux", Discovery: "Découverte", Safety: "Sécurité", Accessibility: "Accessibilité", Other: "Autre" },
  },
  Spanish: {
    kicker: "VIA · BUZÓN DE IDEAS",
    title: "Ayuda a VIA a avanzar.",
    intro: "VIA se construye para y con sus visitantes. Comparte lo que echas de menos, lo que podría funcionar mejor o lo que te gustaría experimentar, crear o descubrir.",
    whatHappens: "¿Qué pasa con tu idea?",
    process: "Revisamos las ideas junto con las necesidades de los visitantes y lo que es técnicamente seguro, práctico y asequible. Una idea puede pasar por:",
    safety: "Nunca compartas contraseñas, seed words de DeSo, claves privadas u otra información confidencial. VIA intenta primero enviar tu idea al buzón central seguro. Si el almacenamiento central no está disponible temporalmente, la idea se guarda solo en este dispositivo.",
    category: "Categoría",
    idea: "Tu idea",
    placeholder: "Cuéntanos qué podría hacer VIA mejor, más útil o más agradable…",
    send: "Enviar mi idea",
    sending: "Enviando…",
    sent: "Recibido por VIA. Gracias.",
    local: "La recepción central aún no está disponible. Tu idea se ha guardado de forma segura en este dispositivo.",
    rate: "Espera aproximadamente un minuto antes de enviar otra idea.",
    error: "La idea no se pudo guardar ahora. Inténtalo de nuevo más tarde.",
    back: "Volver a VIA",
    statuses: ["Recibida", "Revisada", "Explorando", "Planificada", "En desarrollo", "Construida"],
    categories: { NFT: "NFT", Social: "Social", Music: "Música", "VIA LIVE": "VIA LIVE", Games: "Juegos", Discovery: "Descubrimiento", Safety: "Seguridad", Accessibility: "Accesibilidad", Other: "Otro" },
  },
  Chinese: {
    kicker: "VIA · 意见箱",
    title: "帮助 VIA 继续前进。",
    intro: "VIA 为访客而建，也与访客共同建设。告诉我们你缺少什么、哪些地方可以更好，或你希望体验、创作或发现什么。",
    whatHappens: "你的想法会怎样处理？",
    process: "我们会结合访客需求，以及技术上的安全性、实用性和可负担性来评估想法。一个想法可能经历：",
    safety: "请勿分享密码、DeSo seed words、私钥或其他机密信息。VIA 会先尝试将你的想法发送到安全的中央收件箱。如果中央存储暂时不可用，该想法只会保存在此设备上。",
    category: "类别",
    idea: "你的想法",
    placeholder: "告诉我们怎样让 VIA 更好、更实用或更有趣…",
    send: "发送我的想法",
    sending: "发送中…",
    sent: "VIA 已收到。谢谢。",
    local: "中央接收暂不可用。你的想法已安全保存在此设备上。",
    rate: "请等待约一分钟后再发送新的想法。",
    error: "目前无法保存该想法。请稍后再试。",
    back: "返回 VIA",
    statuses: ["已收到", "已审阅", "探索中", "已计划", "开发中", "已完成"],
    categories: { NFT: "NFT", Social: "社交", Music: "音乐", "VIA LIVE": "VIA LIVE", Games: "游戏", Discovery: "发现", Safety: "安全", Accessibility: "无障碍", Other: "其他" },
  },
}

function saveLocally(category: string, idea: string) {
  const current = JSON.parse(localStorage.getItem("via:ideas:drafts:v1") || "[]")
  const items = Array.isArray(current) ? current : []
  items.push({ category, idea: idea.slice(0, 2000), createdAt: new Date().toISOString(), status: "Received" })
  localStorage.setItem("via:ideas:drafts:v1", JSON.stringify(items.slice(-20)))
}

export default function IdeasPage() {
  const [state, setState] = useState<SubmitState>("idle")
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

  async function submitIdea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const idea = String(form.get("idea") || "").trim()
    const category = String(form.get("category") || "Other")
    const website = String(form.get("website") || "")
    if (!idea) return
    setState("sending")
    try {
      const response = await fetch("/api/via/ideas", {
        method: "POST",
        headers: { "content-type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ category, idea, website }),
      })
      const data = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null
      if (response.ok && data?.ok) {
        setState("sent")
        formElement.reset()
        return
      }
      if (response.status === 429) {
        setState("rate")
        return
      }
      if (response.status === 503 && data?.error === "IDEAS_STORAGE_NOT_CONFIGURED") {
        saveLocally(category, idea)
        setState("local")
        formElement.reset()
        return
      }
      setState("error")
    } catch {
      try {
        saveLocally(category, idea)
        setState("local")
        formElement.reset()
      } catch {
        setState("error")
      }
    }
  }

  const t = COPY[language]

  return (
    <main style={{ minHeight: "100vh", background: "#020403", color: "#f4f7f5", padding: "32px 18px 64px", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div style={{ width: "min(820px, 100%)", margin: "0 auto" }}>
        <p style={{ color: "#8fd4a9", fontWeight: 800, letterSpacing: "0.12em", fontSize: 12 }}>{t.kicker}</p>
        <h1 style={{ fontSize: "clamp(30px, 6vw, 52px)", lineHeight: 1.02, margin: "12px 0" }}>{t.title}</h1>
        <p style={{ color: "#b7c5bd", lineHeight: 1.7 }}>{t.intro}</p>

        <section style={{ marginTop: 24, border: "1px solid #347d52", borderRadius: 20, background: "#08100b", padding: 22 }}>
          <h2 style={{ marginTop: 0 }}>{t.whatHappens}</h2>
          <p style={{ color: "#b7c5bd", lineHeight: 1.65 }}>
            {t.process} <strong>{t.statuses.join(" → ")}</strong>.
          </p>
          <p style={{ color: "#b7c5bd", lineHeight: 1.65 }}>{t.safety}</p>
        </section>

        <form onSubmit={submitIdea} style={{ marginTop: 24, display: "grid", gap: 14 }}>
          <label>{t.category}
            <select name="category" defaultValue="Other" style={{ display: "block", width: "100%", marginTop: 7, padding: 12, borderRadius: 12, background: "#08100b", color: "#f4f7f5", border: "1px solid #285f40" }}>
              {categories.map((category) => <option key={category} value={category}>{t.categories[category]}</option>)}
            </select>
          </label>
          <label>{t.idea}
            <textarea name="idea" required maxLength={2000} rows={8} placeholder={t.placeholder} style={{ display: "block", width: "100%", marginTop: 7, padding: 12, borderRadius: 12, background: "#08100b", color: "#f4f7f5", border: "1px solid #285f40", resize: "vertical" }} />
          </label>
          <label style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <button type="submit" disabled={state === "sending"} style={{ justifySelf: "start", border: "1px solid #347d52", borderRadius: 999, padding: "11px 17px", background: "#0b1b11", color: "#b9ffd4", fontWeight: 800, opacity: state === "sending" ? .65 : 1 }}>
            {state === "sending" ? t.sending : t.send}
          </button>
          {state === "sent" && <p role="status" style={{ color: "#8fd4a9" }}>{t.sent}</p>}
          {state === "local" && <p role="status" style={{ color: "#e1c879" }}>{t.local}</p>}
          {state === "rate" && <p role="status" style={{ color: "#e1c879" }}>{t.rate}</p>}
          {state === "error" && <p role="status" style={{ color: "#e6a6a6" }}>{t.error}</p>}
        </form>

        <p style={{ marginTop: 30 }}><Link href="/" style={{ color: "#b9ffd4" }}>← {t.back}</Link></p>
      </div>
    </main>
  )
}
