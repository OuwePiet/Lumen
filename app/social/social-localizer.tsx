"use client"

import { useEffect } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

type Copy = {
  exact: Record<string, string>
  patterns: Array<[RegExp, (...parts: string[]) => string]>
}

const COPY: Record<ViaLanguage, Copy> = {
  English: { exact: {}, patterns: [] },
  Dutch: {
    exact: {
      "Public DeSo conversation on VIA.": "Openbare DeSo-gesprekken op VIA.",
      "Social shortcuts": "Sociale snelkoppelingen",
      "Notifications": "Meldingen",
      "Saved": "Opgeslagen",
      "Create": "Maken",
      "Share a post": "Deel een bericht",
      "Edit your post": "Bewerk je bericht",
      "Feed": "Feed",
      "Posts": "Berichten",
      "Filter posts": "Filter berichten",
      "All": "Alles",
      "Image": "Afbeelding",
      "Video": "Video",
      "Public Hot feed": "Openbare Hot-feed",
      "Newest public DeSo posts": "Nieuwste openbare DeSo-berichten",
      "DeSo login required for Following": "DeSo-login vereist voor Volgend",
      "Open Following": "Open Volgend",
      "Open Hot": "Open Hot",
      "Open New": "Open Nieuw",
      "Loading…": "Laden…",
      "Choose a feed and load posts.": "Kies een feed en laad berichten.",
      "Hot is ready.": "Hot is klaar.",
      "Newest public DeSo posts are ready.": "De nieuwste openbare DeSo-berichten staan klaar.",
      "Log in with DeSo to open Following.": "Log in met DeSo om Volgend te openen.",
      "Following uses your active DeSo account.": "Volgend gebruikt je actieve DeSo-account.",
      "No posts found.": "Geen berichten gevonden.",
      "Posts are temporarily unavailable.": "Berichten zijn tijdelijk niet beschikbaar.",
      "No loaded posts match this filter.": "Geen geladen berichten passen bij dit filter.",
      "Media post": "Mediabericht",
      "Like": "Vind ik leuk",
      "Reply": "Reageren",
      "Repost": "Repost",
      "Diamond": "Diamond",
      "Quote": "Citeren",
      "Participation & safety": "Deelname & veiligheid",
      "Public view · DeSo participation": "Openbare weergave · DeSo-deelname",
      "Public feeds stay open. Posting and other DeSo actions become available only after a valid DeSo Identity login. Blockchain actions keep their own review and approval step.": "Openbare feeds blijven zichtbaar. Plaatsen en andere DeSo-acties worden pas beschikbaar na een geldige DeSo Identity-login. Blockchainacties houden hun eigen controle- en goedkeuringsstap.",
      "VIA never treats a login as a trust badge and never asks for or stores a visitor's seed phrase. Spam, bot, scam and moderation safeguards remain separate from DeSo account access.": "VIA behandelt een login nooit als vertrouwensbadge en vraagt of bewaart nooit de seed phrase van een bezoeker. Beveiliging tegen spam, bots, scams en moderatie blijft losstaan van DeSo-accounttoegang.",
      "Save draft": "Concept opslaan",
      "Clear draft": "Concept wissen",
      "Photo": "Foto",
      "Choose image": "Kies afbeelding",
      "Video": "Video",
      "Poll": "Poll",
      "Emoji": "Emoji",
      "Publish": "Publiceren",
      "Reply": "Reageren",
      "Quote Repost": "Quote Repost",
    },
    patterns: [
      [/^(\d+) posts loaded\.$/u, (count) => `${count} berichten geladen.`],
      [/^Following for (.+)$/u, (account) => `Volgend voor ${account}`],
      [/^Like · (\d+)$/u, (count) => `Vind ik leuk · ${count}`],
      [/^Reply · (\d+)$/u, (count) => `Reageren · ${count}`],
      [/^Repost · (\d+)$/u, (count) => `Repost · ${count}`],
      [/^Diamond · (\d+)$/u, (count) => `Diamond · ${count}`],
      [/^(\d+) reposts$/u, (count) => `${count} reposts`],
      [/^(\d+) characters left$/u, (count) => `${count} tekens over`],
    ],
  },
  French: {
    exact: {
      "Public DeSo conversation on VIA.": "Conversation DeSo publique sur VIA.",
      "Notifications": "Notifications",
      "Saved": "Enregistrés",
      "Create": "Créer",
      "Share a post": "Partager une publication",
      "Edit your post": "Modifier votre publication",
      "Feed": "Fil",
      "Posts": "Publications",
      "All": "Tout",
      "Image": "Image",
      "Video": "Vidéo",
      "Public Hot feed": "Fil Hot public",
      "Newest public DeSo posts": "Publications DeSo publiques les plus récentes",
      "DeSo login required for Following": "Connexion DeSo requise pour Following",
      "Open Following": "Ouvrir Following",
      "Open Hot": "Ouvrir Hot",
      "Open New": "Ouvrir Nouveau",
      "Loading…": "Chargement…",
      "No posts found.": "Aucune publication trouvée.",
      "Posts are temporarily unavailable.": "Les publications sont temporairement indisponibles.",
      "No loaded posts match this filter.": "Aucune publication chargée ne correspond à ce filtre.",
      "Media post": "Publication média",
      "Participation & safety": "Participation et sécurité",
      "Save draft": "Enregistrer le brouillon",
      "Clear draft": "Effacer le brouillon",
      "Photo": "Photo",
      "Choose image": "Choisir une image",
      "Poll": "Sondage",
      "Emoji": "Emoji",
      "Publish": "Publier",
    },
    patterns: [
      [/^(\d+) posts loaded\.$/u, (count) => `${count} publications chargées.`],
      [/^Following for (.+)$/u, (account) => `Following pour ${account}`],
      [/^Like · (\d+)$/u, (count) => `J’aime · ${count}`],
      [/^Reply · (\d+)$/u, (count) => `Répondre · ${count}`],
      [/^Repost · (\d+)$/u, (count) => `Repost · ${count}`],
      [/^Diamond · (\d+)$/u, (count) => `Diamond · ${count}`],
      [/^(\d+) characters left$/u, (count) => `${count} caractères restants`],
    ],
  },
  Spanish: {
    exact: {
      "Public DeSo conversation on VIA.": "Conversación pública de DeSo en VIA.",
      "Notifications": "Notificaciones",
      "Saved": "Guardados",
      "Create": "Crear",
      "Share a post": "Compartir una publicación",
      "Edit your post": "Editar tu publicación",
      "Feed": "Feed",
      "Posts": "Publicaciones",
      "All": "Todo",
      "Image": "Imagen",
      "Video": "Vídeo",
      "Public Hot feed": "Feed Hot público",
      "Newest public DeSo posts": "Publicaciones públicas de DeSo más recientes",
      "DeSo login required for Following": "Se requiere inicio de sesión DeSo para Following",
      "Open Following": "Abrir Following",
      "Open Hot": "Abrir Hot",
      "Open New": "Abrir Nuevo",
      "Loading…": "Cargando…",
      "No posts found.": "No se encontraron publicaciones.",
      "Posts are temporarily unavailable.": "Las publicaciones no están disponibles temporalmente.",
      "No loaded posts match this filter.": "Ninguna publicación cargada coincide con este filtro.",
      "Media post": "Publicación multimedia",
      "Participation & safety": "Participación y seguridad",
      "Save draft": "Guardar borrador",
      "Clear draft": "Borrar borrador",
      "Photo": "Foto",
      "Choose image": "Elegir imagen",
      "Poll": "Encuesta",
      "Emoji": "Emoji",
      "Publish": "Publicar",
    },
    patterns: [
      [/^(\d+) posts loaded\.$/u, (count) => `${count} publicaciones cargadas.`],
      [/^Following for (.+)$/u, (account) => `Following para ${account}`],
      [/^Like · (\d+)$/u, (count) => `Me gusta · ${count}`],
      [/^Reply · (\d+)$/u, (count) => `Responder · ${count}`],
      [/^Repost · (\d+)$/u, (count) => `Repost · ${count}`],
      [/^Diamond · (\d+)$/u, (count) => `Diamond · ${count}`],
      [/^(\d+) characters left$/u, (count) => `${count} caracteres restantes`],
    ],
  },
  Chinese: {
    exact: {
      "Public DeSo conversation on VIA.": "VIA 上的公开 DeSo 对话。",
      "Notifications": "通知",
      "Saved": "已保存",
      "Create": "创建",
      "Share a post": "发布内容",
      "Edit your post": "编辑你的帖子",
      "Feed": "动态",
      "Posts": "帖子",
      "All": "全部",
      "Image": "图片",
      "Video": "视频",
      "Public Hot feed": "公开 Hot 动态",
      "Newest public DeSo posts": "最新公开 DeSo 帖子",
      "DeSo login required for Following": "Following 需要 DeSo 登录",
      "Open Following": "打开 Following",
      "Open Hot": "打开 Hot",
      "Open New": "打开最新",
      "Loading…": "正在加载…",
      "No posts found.": "未找到帖子。",
      "Posts are temporarily unavailable.": "帖子暂时不可用。",
      "No loaded posts match this filter.": "没有已加载的帖子符合此筛选条件。",
      "Media post": "媒体帖子",
      "Participation & safety": "参与与安全",
      "Save draft": "保存草稿",
      "Clear draft": "清除草稿",
      "Photo": "照片",
      "Choose image": "选择图片",
      "Poll": "投票",
      "Emoji": "表情",
      "Publish": "发布",
    },
    patterns: [
      [/^(\d+) posts loaded\.$/u, (count) => `已加载 ${count} 个帖子。`],
      [/^Following for (.+)$/u, (account) => `${account} 的 Following`],
      [/^Like · (\d+)$/u, (count) => `点赞 · ${count}`],
      [/^Reply · (\d+)$/u, (count) => `回复 · ${count}`],
      [/^Repost · (\d+)$/u, (count) => `转发 · ${count}`],
      [/^Diamond · (\d+)$/u, (count) => `Diamond · ${count}`],
      [/^(\d+) characters left$/u, (count) => `还可输入 ${count} 个字符`],
    ],
  },
}

const originalText = new WeakMap<Text, string>()
const originalAttributes = new WeakMap<Element, Map<string, string>>()

function translated(source: string, copy: Copy) {
  const exact = copy.exact[source]
  if (exact !== undefined) return exact
  for (const [pattern, replacement] of copy.patterns) {
    const match = source.match(pattern)
    if (match) return replacement(...match.slice(1))
  }
  return source
}

function translateRoot(root: HTMLElement, language: ViaLanguage) {
  const copy = COPY[language]
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    const textNode = node as Text
    const current = textNode.nodeValue ?? ""
    const trimmed = current.trim()
    if (trimmed) {
      const source = originalText.get(textNode) ?? trimmed
      if (!originalText.has(textNode)) originalText.set(textNode, source)
      const next = language === "English" ? source : translated(source, copy)
      if (next !== trimmed) {
        const leading = current.slice(0, current.length - current.trimStart().length)
        const trailing = current.slice(current.trimEnd().length)
        textNode.nodeValue = `${leading}${next}${trailing}`
      }
    }
    node = walker.nextNode()
  }

  for (const element of Array.from(root.querySelectorAll<HTMLElement>("[placeholder], [aria-label], [title]"))) {
    for (const attribute of ["placeholder", "aria-label", "title"] as const) {
      const current = element.getAttribute(attribute)
      if (!current) continue
      let originals = originalAttributes.get(element)
      if (!originals) {
        originals = new Map<string, string>()
        originalAttributes.set(element, originals)
      }
      const source = originals.get(attribute) ?? current
      if (!originals.has(attribute)) originals.set(attribute, source)
      const next = language === "English" ? source : translated(source, copy)
      if (next !== current) element.setAttribute(attribute, next)
    }
  }
}

export default function SocialLocalizer() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-via-social-page]")
    if (!root) return

    let queued = false
    const apply = () => {
      queued = false
      translateRoot(root, readViaLocalSettings().interfaceLanguage)
    }
    const schedule = () => {
      if (queued) return
      queued = true
      window.requestAnimationFrame(apply)
    }

    apply()
    const observer = new MutationObserver(schedule)
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "aria-label", "title"] })
    window.addEventListener(VIA_SETTINGS_EVENT, schedule)
    window.addEventListener("storage", schedule)
    return () => {
      observer.disconnect()
      window.removeEventListener(VIA_SETTINGS_EVENT, schedule)
      window.removeEventListener("storage", schedule)
    }
  }, [])

  return null
}
