"use client"

import ViaRewardButton from "../social/via-reward-button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"
import { useViaIdentitySession } from "../use-via-identity-session"
import LocalSaveButton from "../social/local-save-button"
import { ViaPostActionBar, ViaMoreActions } from "../social/via-post-action-bar"

type Association = {
  AssociationID: string
  PostHashHex: string
  PostEntry?: { Body?: string; PosterPublicKeyBase58Check?: string; TimestampNanos?: number }
}
type QueryResponse = { ok?: boolean; result?: { Associations?: Association[]; PostHashHexToPostEntryResponse?: Record<string, Association["PostEntry"]> } }

const COPY: Record<ViaLanguage, { login: string; loading: string; empty: string; error: string; heading: string; fallback: string; open: string; link: string; more: string }> = {
  English: { login: "Log in via VIA to see your DeSo bookmarks.", loading: "Loading DeSo bookmarks…", empty: "No DeSo bookmarks saved yet.", error: "Could not load DeSo bookmarks.", heading: "Posts saved on DeSo", fallback: "DeSo post", open: "Open post", link: "Copy post link", more: "More post actions" },
  Dutch: { login: "Log in via VIA om je DeSo-bladwijzers te zien.", loading: "DeSo-bladwijzers laden…", empty: "Nog geen DeSo-bladwijzers opgeslagen.", error: "DeSo-bladwijzers konden niet worden geladen.", heading: "Op DeSo opgeslagen berichten", fallback: "DeSo-bericht", open: "Open bericht", link: "Kopieer berichtlink", more: "Meer berichtacties" },
  French: { login: "Connectez-vous à VIA pour voir vos favoris DeSo.", loading: "Chargement des favoris DeSo…", empty: "Aucun favori DeSo enregistré.", error: "Impossible de charger les favoris DeSo.", heading: "Publications enregistrées sur DeSo", fallback: "Publication DeSo", open: "Ouvrir la publication", link: "Copier le lien", more: "Autres actions" },
  Spanish: { login: "Inicia sesión en VIA para ver tus guardados DeSo.", loading: "Cargando guardados DeSo…", empty: "Aún no hay publicaciones guardadas en DeSo.", error: "No se pudieron cargar los guardados DeSo.", heading: "Publicaciones guardadas en DeSo", fallback: "Publicación DeSo", open: "Abrir publicación", link: "Copiar enlace", more: "Más acciones" },
  Chinese: { login: "请通过 VIA 登录以查看 DeSo 书签。", loading: "正在加载 DeSo 书签…", empty: "尚未保存 DeSo 书签。", error: "无法加载 DeSo 书签。", heading: "保存在 DeSo 上的帖子", fallback: "DeSo 帖子", open: "打开帖子", link: "复制帖子链接", more: "更多操作" },
  Hindi: { login: "DeSo बुकमार्क देखने के लिए VIA से लॉग इन करें।", loading: "DeSo बुकमार्क लोड हो रहे हैं…", empty: "अभी कोई DeSo बुकमार्क नहीं है।", error: "DeSo बुकमार्क लोड नहीं हो सके।", heading: "DeSo पर सहेजे गए पोस्ट", fallback: "DeSo पोस्ट", open: "पोस्ट खोलें", link: "पोस्ट लिंक कॉपी करें", more: "अधिक विकल्प" },
}

export default function DeSoSavedPosts() {
  const [language, setLanguage] = useState<ViaLanguage>("English")
  const copy = COPY[language] ?? COPY.English
  useEffect(() => {
    const refresh = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    refresh()
    window.addEventListener(VIA_SETTINGS_EVENT, refresh)
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, refresh)
  }, [])
  const session = useViaIdentitySession()
  const account = session?.publicKey
  const [items, setItems] = useState<Association[]>([])
  const [status, setStatus] = useState("")

  useEffect(() => {
    if (!account) { setItems([]); setStatus(copy.login); return }
    let active = true
    const load = async () => {
      setStatus(copy.loading)
      try {
        const found: Association[] = []
        const seen = new Set<string>()
        let cursor: string | undefined
        for (let page = 0; page < 100; page++) {
          const response = await fetch("/api/via/social/bookmark", {
            method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
            body: JSON.stringify({ action: "query", publicKey: account, ...(cursor ? { lastSeenAssociationID: cursor } : {}) }),
          })
          const data = await response.json() as QueryResponse
          const batch = data.result?.Associations
          if (!response.ok || !data.ok || !Array.isArray(batch)) throw new Error("DESO_QUERY_FAILED")
          for (const item of batch) {
            const post = item.PostEntry ?? data.result?.PostHashHexToPostEntryResponse?.[item.PostHashHex]
            if (item.PostHashHex && !seen.has(item.PostHashHex)) {
              seen.add(item.PostHashHex)
              found.push({ ...item, PostEntry: post })
            }
          }
          if (batch.length < 100) break
          const last = batch[batch.length - 1]?.AssociationID
          if (!last || last === cursor) throw new Error("INVALID_CURSOR")
          cursor = last
          if (page === 99) throw new Error("PAGINATION_LIMIT")
        }
        if (active) { setItems(found); setStatus(found.length ? "" : copy.empty) }
      } catch { if (active) setStatus(copy.error) }
    }
    void load()
    window.addEventListener("via:saved:changed", load)
    return () => { active = false; window.removeEventListener("via:saved:changed", load) }
  }, [account, language])

  return <section className="mb-8" aria-label={copy.heading}>
    <h2 className="mb-3 text-lg font-semibold text-[#9adbb2]">{copy.heading}</h2>
    {status ? <p role="status" className="text-sm text-zinc-400">{status}</p> : null}
    <div className="grid gap-3">
      {items.map(item => <article key={item.AssociationID} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <p className="whitespace-pre-wrap text-sm text-zinc-200">{item.PostEntry?.Body || copy.fallback}</p>
        <ViaPostActionBar className="mt-3">
          <Link className="inline-flex h-9 items-center rounded-full border border-zinc-800 px-3 text-xs text-zinc-300" href={`/social?post=${encodeURIComponent(item.PostHashHex)}`}>{copy.open}</Link>
          {item.PostEntry?.PosterPublicKeyBase58Check ? <ViaRewardButton recipientPublicKey={item.PostEntry.PosterPublicKeyBase58Check} /> : null}
          <ViaMoreActions label={copy.more}>
            {item.PostEntry?.PosterPublicKeyBase58Check ? <div className="[&_button]:w-full [&_button]:justify-start [&_button]:border-0"><LocalSaveButton postHash={item.PostHashHex} body={item.PostEntry.Body ?? ""} publicKey={item.PostEntry.PosterPublicKeyBase58Check} timestampNanos={item.PostEntry.TimestampNanos ?? 0} /></div> : null}
            <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-xs text-zinc-300" onClick={() => void navigator.clipboard?.writeText(`${window.location.origin}/social?post=${encodeURIComponent(item.PostHashHex)}`)}>{copy.link}</button>
          </ViaMoreActions>
        </ViaPostActionBar>
      </article>)}
    </div>
  </section>
}
