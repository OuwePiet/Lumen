"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

const CLOUDFLARE_R2_URL = "https://www.cloudflare.com/products/r2/"
const CLOUDFLARE_R2_PRICING_URL = "https://developers.cloudflare.com/r2/pricing/"

type Copy = {
  kicker: string
  title: string
  intro: string
  visitorTitle: string
  visitorText: string
  visitorAction: string
  communityTitle: string
  communityText: string
  communityAction: string
  priceTitle: string
  free: string
  paid: string
  egress: string
  operations: string
  note: string
  providerAction: string
  back: string
}

const copy: Record<ViaLanguage, Copy> = {
  Dutch: {
    kicker: "VIA · EXTERNE OPSLAG",
    title: "Opslag zonder eigen VIA-server",
    intro: "Voor grote bestanden, media, documenten, archieven en collecties gebruikt VIA externe opslag. Je bestand staat bij de gekozen opslagprovider; VIA presenteert zichzelf niet als opslagprovider.",
    visitorTitle: "Voor bezoekers",
    visitorText: "Heb je alleen betrouwbare externe opslag nodig? Open de externe opslagprovider rechtstreeks. Je hebt daarvoor geen DeSo-account nodig.",
    visitorAction: "Open externe opslag",
    communityTitle: "Voor communityleden",
    communityText: "Gebruik dezelfde externe opslag voor creatorbestanden, media en archieven. Voor VIA-creatorwerk ga je daarna verder in Studio; on-chain handelingen blijven via DeSo Identity lopen.",
    communityAction: "Ga naar VIA Studio",
    priceTitle: "Actuele R2-basisprijs",
    free: "10 GB-maand inbegrepen per maand",
    paid: "$0,015 per GB-maand boven de gratis opslag",
    egress: "Internet-egress: gratis",
    operations: "Upload-, lees- en lijstbewerkingen kunnen apart worden berekend door de provider.",
    note: "De provider toont altijd de actuele prijs en voorwaarden. VIA slaat hier geen eigen kopie van je bestand op.",
    providerAction: "Bekijk actuele providerprijzen",
    back: "Terug naar VIA",
  },
  English: {
    kicker: "VIA · EXTERNAL STORAGE",
    title: "Storage without a VIA-owned server",
    intro: "For large files, media, documents, archives and collections, VIA uses external storage. Your file remains with the selected storage provider; VIA does not present itself as the storage provider.",
    visitorTitle: "For visitors",
    visitorText: "Only need reliable external storage? Open the external storage provider directly. A DeSo account is not required.",
    visitorAction: "Open external storage",
    communityTitle: "For community members",
    communityText: "Use the same external storage for creator files, media and archives. For VIA creator work, continue in Studio afterwards; on-chain actions still use DeSo Identity.",
    communityAction: "Go to VIA Studio",
    priceTitle: "Current R2 base pricing",
    free: "10 GB-month included each month",
    paid: "$0.015 per GB-month above included storage",
    egress: "Internet egress: free",
    operations: "Upload, read and list operations may be billed separately by the provider.",
    note: "The provider always shows the current price and terms. VIA does not keep its own copy of your file here.",
    providerAction: "View current provider pricing",
    back: "Back to VIA",
  },
  French: {
    kicker: "VIA · STOCKAGE EXTERNE",
    title: "Stockage sans serveur VIA propre",
    intro: "Pour les fichiers volumineux, médias, documents, archives et collections, VIA utilise un stockage externe. Votre fichier reste chez le fournisseur choisi; VIA n'agit pas comme fournisseur de stockage.",
    visitorTitle: "Pour les visiteurs",
    visitorText: "Besoin uniquement d'un stockage externe fiable? Ouvrez directement le fournisseur. Aucun compte DeSo n'est requis.",
    visitorAction: "Ouvrir le stockage externe",
    communityTitle: "Pour les membres de la communauté",
    communityText: "Utilisez le même stockage externe pour vos fichiers créateur, médias et archives. Pour le travail créateur VIA, poursuivez ensuite dans Studio; les actions on-chain restent via DeSo Identity.",
    communityAction: "Ouvrir VIA Studio",
    priceTitle: "Tarif de base R2 actuel",
    free: "10 GB-mois inclus chaque mois",
    paid: "$0,015 par GB-mois au-delà du stockage inclus",
    egress: "Egress Internet: gratuit",
    operations: "Les opérations d'upload, lecture et liste peuvent être facturées séparément par le fournisseur.",
    note: "Le fournisseur affiche toujours le prix et les conditions en vigueur. VIA ne conserve pas sa propre copie du fichier ici.",
    providerAction: "Voir les tarifs actuels",
    back: "Retour à VIA",
  },
  Spanish: {
    kicker: "VIA · ALMACENAMIENTO EXTERNO",
    title: "Almacenamiento sin servidor propio de VIA",
    intro: "Para archivos grandes, medios, documentos, archivos y colecciones, VIA utiliza almacenamiento externo. Tu archivo permanece con el proveedor elegido; VIA no actúa como proveedor de almacenamiento.",
    visitorTitle: "Para visitantes",
    visitorText: "¿Solo necesitas almacenamiento externo fiable? Abre directamente el proveedor. No necesitas una cuenta DeSo.",
    visitorAction: "Abrir almacenamiento externo",
    communityTitle: "Para miembros de la comunidad",
    communityText: "Usa el mismo almacenamiento externo para archivos de creador, medios y archivos. Para trabajo de creador en VIA, continúa después en Studio; las acciones on-chain siguen usando DeSo Identity.",
    communityAction: "Ir a VIA Studio",
    priceTitle: "Precio base actual de R2",
    free: "10 GB-mes incluidos cada mes",
    paid: "$0,015 por GB-mes por encima del almacenamiento incluido",
    egress: "Egress a Internet: gratis",
    operations: "Las operaciones de subida, lectura y listado pueden cobrarse aparte por el proveedor.",
    note: "El proveedor siempre muestra el precio y las condiciones actuales. VIA no conserva aquí una copia propia del archivo.",
    providerAction: "Ver precios actuales del proveedor",
    back: "Volver a VIA",
  },
  Chinese: {
    kicker: "VIA · 外部存储",
    title: "无需 VIA 自建服务器的存储",
    intro: "对于大型文件、媒体、文档、档案和收藏，VIA 使用外部存储。文件保存在所选存储提供商处；VIA 本身不作为存储提供商。",
    visitorTitle: "访客",
    visitorText: "如果你只需要可靠的外部存储，可以直接打开外部存储提供商，无需 DeSo 账户。",
    visitorAction: "打开外部存储",
    communityTitle: "社区成员",
    communityText: "同样的外部存储可用于创作者文件、媒体和档案。VIA 创作者工作可随后进入 Studio；链上操作仍通过 DeSo Identity 完成。",
    communityAction: "进入 VIA Studio",
    priceTitle: "当前 R2 基础价格",
    free: "每月包含 10 GB-month",
    paid: "超出免费额度后每 GB-month $0.015",
    egress: "互联网出口流量：免费",
    operations: "上传、读取和列出操作可能由提供商单独计费。",
    note: "提供商始终显示当前价格和条款。VIA 不在此保存你的文件副本。",
    providerAction: "查看当前提供商价格",
    back: "返回 VIA",
  },
  Hindi: {
    kicker: "VIA · EXTERNAL STORAGE",
    title: "Storage without a VIA-owned server",
    intro: "For large files, media, documents, archives and collections, VIA uses external storage. Your file remains with the selected storage provider; VIA does not present itself as the storage provider.",
    visitorTitle: "For visitors",
    visitorText: "Only need reliable external storage? Open the external storage provider directly. A DeSo account is not required.",
    visitorAction: "Open external storage",
    communityTitle: "For community members",
    communityText: "Use the same external storage for creator files, media and archives. For VIA creator work, continue in Studio afterwards; on-chain actions still use DeSo Identity.",
    communityAction: "Go to VIA Studio",
    priceTitle: "Current R2 base pricing",
    free: "10 GB-month included each month",
    paid: "$0.015 per GB-month above included storage",
    egress: "Internet egress: free",
    operations: "Upload, read and list operations may be billed separately by the provider.",
    note: "The provider always shows the current price and terms. VIA does not keep its own copy of your file here.",
    providerAction: "View current provider pricing",
    back: "Back to VIA",
  },
}

const primary = "inline-flex min-h-11 items-center justify-center rounded-[12px] border border-[#8fd4a9]/50 bg-[#0c1711]/40 px-4 py-2 text-sm font-semibold text-[#9adbb2] transition hover:border-[#8fd4a9]/75 hover:bg-[#0c1711]/65"
const secondary = "inline-flex min-h-11 items-center justify-center rounded-[12px] border border-zinc-700/80 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-[#8fd4a9]/45 hover:text-[#9adbb2]"

export default function StoragePage() {
  const [language, setLanguage] = useState<ViaLanguage>("English")

  useEffect(() => {
    const refresh = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    refresh()
    window.addEventListener(VIA_SETTINGS_EVENT, refresh)
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, refresh)
  }, [])

  const t = copy[language]

  return (
    <main className="min-h-screen bg-[#050807] px-5 py-8 text-zinc-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">{t.kicker}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.25rem]">{t.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">{t.intro}</p>
          </div>
          <Link href="/" className={secondary}>{t.back}</Link>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-[14px] border border-zinc-800/80 bg-zinc-950/55 p-5 sm:p-6">
            <h2 className="text-xl font-medium">{t.visitorTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{t.visitorText}</p>
            <a href={CLOUDFLARE_R2_URL} target="_blank" rel="noreferrer" className={`${primary} mt-5`}>{t.visitorAction}</a>
          </article>

          <article className="rounded-[14px] border border-zinc-800/80 bg-zinc-950/55 p-5 sm:p-6">
            <h2 className="text-xl font-medium">{t.communityTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{t.communityText}</p>
            <Link href="/studio" className={`${primary} mt-5`}>{t.communityAction}</Link>
          </article>
        </section>

        <section className="mt-4 rounded-[14px] border border-[#8fd4a9]/20 bg-[#08110c]/55 p-5 sm:p-6">
          <h2 className="text-xl font-medium text-zinc-100">{t.priceTitle}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[t.free, t.paid, t.egress, t.operations].map((item) => (
              <div key={item} className="rounded-[11px] border border-zinc-800/80 bg-black/20 px-4 py-3 text-sm leading-6 text-zinc-300">{item}</div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-zinc-500">{t.note}</p>
          <a href={CLOUDFLARE_R2_PRICING_URL} target="_blank" rel="noreferrer" className={`${secondary} mt-4`}>{t.providerAction}</a>
        </section>
      </div>
    </main>
  )
}
