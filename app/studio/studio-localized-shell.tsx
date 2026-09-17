"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

type Copy = {
  badge: string
  kicker: string
  heading: string
  intro: string
  createPost: string
  createPostText: string
  mintNft: string
  mintNftText: string
  media: string
  mediaText: string
  drafts: string
  draftsText: string
  mediaHeading: string
  mediaBody: string
  createWithMedia: string
  safety: string
  safetyBody: string
}

const copy: Record<ViaLanguage, Copy> = {
  Dutch: {
    badge: "VIA Studio",
    kicker: "Maken · voorbereiden · minten",
    heading: "Studio",
    intro: "Eén rustige werkplek om een post te maken, media voor te bereiden, concepten te bewaren en een native DeSo-NFT te minten.",
    createPost: "Post maken",
    createPostText: "Open de vrijgegeven VIA Feed-composer en publiceer via de beveiligde DeSo-stroom.",
    mintNft: "NFT minten",
    mintNftText: "Stel NFT-voorwaarden in, controleer de actuele kosten vooraf en keur de native DeSo-mint goed.",
    media: "Media",
    mediaText: "Bereid media voor een post of NFT voor zonder een tweede uploadroute te maken.",
    drafts: "Concepten",
    draftsText: "Bereid lokaal werk voor en bewaar niet-geheime concepten op dit apparaat voordat je publiceert.",
    mediaHeading: "Bereid media voor waar die wordt gebruikt",
    mediaBody: "Afbeeldingen en video voor posts blijven in de vrijgegeven Feed-composer. NFT-media en opslagkeuzes blijven bij de NFT-mint hieronder, zodat Studio geen uploadfuncties dupliceert.",
    createWithMedia: "Maken met media",
    safety: "Studio-veiligheid",
    safetyBody: "VIA scheidt voorbereiding van blockchain-goedkeuring. Vrijgegeven DeSo-posts en NFT-mints behouden hun expliciete DeSo Identity-goedkeuring; VIA vraagt nooit om een seed phrase of private signing key en bewaart die ook niet.",
  },
  English: {
    badge: "VIA Studio",
    kicker: "Create · prepare · mint",
    heading: "Studio",
    intro: "One calm workspace for creating a post, preparing media, saving drafts and minting a native DeSo NFT.",
    createPost: "Create Post",
    createPostText: "Open the released VIA Feed composer and publish through the guarded DeSo flow.",
    mintNft: "Mint NFT",
    mintNftText: "Set NFT terms, review the current cost preflight and approve the native DeSo mint.",
    media: "Media",
    mediaText: "Prepare media for a post or NFT without creating a second upload route.",
    drafts: "Drafts",
    draftsText: "Prepare and keep non-secret work locally on this device before publishing.",
    mediaHeading: "Prepare media where it will be used",
    mediaBody: "Image and video attachments for posts stay in the released Feed composer. NFT media and storage choices stay with the NFT mint flow below, so Studio does not duplicate upload controls.",
    createWithMedia: "Create with media",
    safety: "Studio safety",
    safetyBody: "VIA separates preparation from blockchain approval. Released DeSo posting and NFT minting keep their explicit DeSo Identity approval steps; VIA never asks for or stores a seed phrase or private signing key.",
  },
  French: {
    badge: "VIA Studio",
    kicker: "Créer · préparer · minter",
    heading: "Studio",
    intro: "Un espace calme pour créer un post, préparer des médias, enregistrer des brouillons et minter un NFT DeSo natif.",
    createPost: "Créer un post",
    createPostText: "Ouvrez le compositeur VIA Feed publié et publiez via le flux DeSo sécurisé.",
    mintNft: "Minter un NFT",
    mintNftText: "Définissez les conditions du NFT, vérifiez les coûts actuels et approuvez le mint DeSo natif.",
    media: "Médias",
    mediaText: "Préparez des médias pour un post ou un NFT sans créer une deuxième route de téléversement.",
    drafts: "Brouillons",
    draftsText: "Préparez et conservez localement sur cet appareil le travail non secret avant publication.",
    mediaHeading: "Préparez les médias là où ils seront utilisés",
    mediaBody: "Les images et vidéos des posts restent dans le compositeur Feed publié. Les médias NFT et les choix de stockage restent dans le flux de mint ci-dessous, afin que Studio ne duplique pas les contrôles de téléversement.",
    createWithMedia: "Créer avec des médias",
    safety: "Sécurité Studio",
    safetyBody: "VIA sépare la préparation de l’approbation blockchain. La publication DeSo et le mint NFT conservent leurs étapes d’approbation DeSo Identity explicites ; VIA ne demande ni ne stocke jamais de seed phrase ou de clé privée de signature.",
  },
  Spanish: {
    badge: "VIA Studio",
    kicker: "Crear · preparar · mintear",
    heading: "Studio",
    intro: "Un espacio tranquilo para crear una publicación, preparar medios, guardar borradores y mintear un NFT nativo de DeSo.",
    createPost: "Crear publicación",
    createPostText: "Abre el compositor VIA Feed publicado y publica mediante el flujo DeSo protegido.",
    mintNft: "Mintear NFT",
    mintNftText: "Configura los términos del NFT, revisa el coste actual y aprueba el mint nativo de DeSo.",
    media: "Medios",
    mediaText: "Prepara medios para una publicación o NFT sin crear una segunda ruta de carga.",
    drafts: "Borradores",
    draftsText: "Prepara y guarda localmente trabajo no secreto en este dispositivo antes de publicar.",
    mediaHeading: "Prepara los medios donde se utilizarán",
    mediaBody: "Las imágenes y vídeos de publicaciones permanecen en el compositor Feed publicado. Los medios NFT y las opciones de almacenamiento permanecen en el flujo de mint inferior, para que Studio no duplique controles de carga.",
    createWithMedia: "Crear con medios",
    safety: "Seguridad de Studio",
    safetyBody: "VIA separa la preparación de la aprobación blockchain. La publicación DeSo y el mint NFT mantienen sus pasos explícitos de aprobación con DeSo Identity; VIA nunca pide ni almacena una seed phrase ni una clave privada de firma.",
  },
  Chinese: {
    badge: "VIA Studio",
    kicker: "创建 · 准备 · 铸造",
    heading: "Studio",
    intro: "一个安静的工作区，用于创建帖子、准备媒体、保存草稿并铸造原生 DeSo NFT。",
    createPost: "创建帖子",
    createPostText: "打开已发布的 VIA Feed 编辑器，并通过受保护的 DeSo 流程发布。",
    mintNft: "铸造 NFT",
    mintNftText: "设置 NFT 条款，查看当前费用预检，并批准原生 DeSo 铸造。",
    media: "媒体",
    mediaText: "为帖子或 NFT 准备媒体，而无需创建第二套上传流程。",
    drafts: "草稿",
    draftsText: "发布前在此设备上本地准备并保存非敏感草稿。",
    mediaHeading: "在实际使用位置准备媒体",
    mediaBody: "帖子图片和视频保留在已发布的 Feed 编辑器中。NFT 媒体和存储选项保留在下方 NFT 铸造流程中，因此 Studio 不重复上传控件。",
    createWithMedia: "使用媒体创建",
    safety: "Studio 安全",
    safetyBody: "VIA 将准备与区块链批准分开。DeSo 发布和 NFT 铸造继续使用明确的 DeSo Identity 批准步骤；VIA 从不索要或存储助记词或私有签名密钥。",
  },
}

const choiceClass = "group rounded-[14px] border border-zinc-800/80 bg-zinc-950/55 p-5 transition-[background-color,border-color] duration-200 hover:border-[#8fd4a9]/45 hover:bg-[#0c1711]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15"

export default function StudioLocalizedShell() {
  const [language, setLanguage] = useState<ViaLanguage>("English")

  useEffect(() => {
    const refresh = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    refresh()
    window.addEventListener(VIA_SETTINGS_EVENT, refresh)
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, refresh)
  }, [])

  const t = copy[language]
  const choices = useMemo(() => [
    { title: t.createPost, text: t.createPostText, href: "/social" },
    { title: t.mintNft, text: t.mintNftText, href: "#mint-nft" },
    { title: t.media, text: t.mediaText, href: "#media" },
    { title: t.drafts, text: t.draftsText, href: "#drafts" },
  ], [t])

  return (
    <>
      <nav className="mb-10 flex flex-wrap items-center justify-between gap-3" aria-label="Studio navigation">
        <Link href="/" className="inline-flex min-h-10 items-center rounded-[11px] border border-zinc-700/80 bg-transparent px-3 py-2 text-sm font-semibold text-zinc-300 transition-[background-color,border-color,color] duration-200 hover:border-[#8fd4a9]/50 hover:bg-[#0c1711]/35 hover:text-[#9adbb2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15">← VIA</Link>
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">{t.badge}</span>
      </nav>

      <header className="mb-7 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">{t.kicker}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.5rem]">{t.heading}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">{t.intro}</p>
      </header>

      <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Studio primary choices">
        {choices.map((choice) => (
          <Link href={choice.href} className={choiceClass} key={choice.href}>
            <span className="text-base font-semibold text-zinc-100 transition-colors group-hover:text-[#9adbb2]">{choice.title}</span>
            <span className="mt-2 block text-sm leading-5 text-zinc-400">{choice.text}</span>
          </Link>
        ))}
      </section>

      <section id="media" className="mb-4 rounded-[14px] border border-zinc-800/80 bg-zinc-950/45 p-5 sm:p-6" aria-labelledby="studio-media-heading">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">{t.media}</p>
            <h2 id="studio-media-heading" className="mt-2 text-xl font-semibold tracking-tight">{t.mediaHeading}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{t.mediaBody}</p>
          </div>
          <Link href="/social" className="inline-flex min-h-11 items-center rounded-[11px] border border-[#8fd4a9]/45 bg-transparent px-4 py-2 text-sm font-semibold text-[#9adbb2] transition-[background-color,border-color] hover:border-[#8fd4a9]/70 hover:bg-[#0c1711]/40">{t.createWithMedia}</Link>
        </div>
      </section>

      <details className="mt-4 rounded-[14px] border border-zinc-800/80 bg-zinc-950/35 p-5 text-sm text-zinc-400">
        <summary className="cursor-pointer font-medium text-zinc-200">{t.safety}</summary>
        <p className="mt-3 leading-6">{t.safetyBody}</p>
      </details>
    </>
  )
}
