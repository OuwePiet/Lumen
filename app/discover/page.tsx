"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings"

type Copy = {
  title: string
  intro: string
  more: string
  primary: Array<{ title: string; text: string; href: string; action: string }>
  secondary: Array<{ title: string; href: string }>
}

const COPY: Record<ViaLanguage, Copy> = {
  Dutch: {
    title: "Ontdekken",
    intro: "Vind mensen, posts, media, NFT’s en ideeën binnen VIA en DeSo.",
    more: "Meer ontdekken",
    primary: [
      { title: "Mensen", text: "Vind creators en accounts op DeSo.", href: "/discover/voices", action: "Ontdek mensen" },
      { title: "Content", text: "Bekijk posts, afbeeldingen, video en NFT’s.", href: "/social", action: "Ontdek content" },
      { title: "Categorieën", text: "Ontdek kunst, fotografie, muziek, video, verzamelen, erfgoed en verhalen.", href: "/discover/world", action: "Ontdek categorieën" },
      { title: "Verrassing", text: "Open iets onverwachts uit VIA Discover.", href: "/discover/surprise", action: "Verras me" },
    ],
    secondary: [
      { title: "Rond de wereld", href: "/discover/world" },
      { title: "Nieuwe stemmen", href: "/discover/voices" },
      { title: "NFT’s", href: "/collection" },
      { title: "Wereldradio", href: "/radio" },
      { title: "Wereldnieuws", href: "/news" },
      { title: "Evenementen", href: "/events" },
      { title: "Leren", href: "/learn" },
      { title: "Laat zien wat je maakt", href: "/show-your-stuff" },
    ],
  },
  English: {
    title: "Discover",
    intro: "Find people, posts, media, NFTs and ideas across VIA and DeSo.",
    more: "More to explore",
    primary: [
      { title: "People", text: "Find creators and accounts on DeSo.", href: "/discover/voices", action: "Discover People" },
      { title: "Content", text: "Browse posts, images, video and NFTs.", href: "/social", action: "Discover Content" },
      { title: "Categories", text: "Explore art, photography, music, video, collecting, heritage and stories.", href: "/discover/world", action: "Explore Categories" },
      { title: "Surprise", text: "Open something unexpected from VIA discovery.", href: "/discover/surprise", action: "Surprise Me" },
    ],
    secondary: [
      { title: "Around the World", href: "/discover/world" },
      { title: "New Voices", href: "/discover/voices" },
      { title: "NFTs", href: "/collection" },
      { title: "World Radio", href: "/radio" },
      { title: "The World News", href: "/news" },
      { title: "Events", href: "/events" },
      { title: "Learn", href: "/learn" },
      { title: "Show Your Stuff", href: "/show-your-stuff" },
    ],
  },
  French: {
    title: "Découvrir",
    intro: "Trouvez des personnes, publications, médias, NFT et idées dans VIA et DeSo.",
    more: "Explorer davantage",
    primary: [
      { title: "Personnes", text: "Trouvez des créateurs et des comptes sur DeSo.", href: "/discover/voices", action: "Découvrir des personnes" },
      { title: "Contenu", text: "Parcourez les publications, images, vidéos et NFT.", href: "/social", action: "Découvrir le contenu" },
      { title: "Catégories", text: "Explorez l’art, la photographie, la musique, la vidéo, les collections, le patrimoine et les récits.", href: "/discover/world", action: "Explorer les catégories" },
      { title: "Surprise", text: "Ouvrez quelque chose d’inattendu dans VIA Discover.", href: "/discover/surprise", action: "Surprenez-moi" },
    ],
    secondary: [
      { title: "Autour du monde", href: "/discover/world" },
      { title: "Nouvelles voix", href: "/discover/voices" },
      { title: "NFT", href: "/collection" },
      { title: "Radio mondiale", href: "/radio" },
      { title: "Actualités mondiales", href: "/news" },
      { title: "Événements", href: "/events" },
      { title: "Apprendre", href: "/learn" },
      { title: "Montrez votre travail", href: "/show-your-stuff" },
    ],
  },
  Spanish: {
    title: "Descubrir",
    intro: "Encuentra personas, publicaciones, medios, NFT e ideas en VIA y DeSo.",
    more: "Más por descubrir",
    primary: [
      { title: "Personas", text: "Encuentra creadores y cuentas en DeSo.", href: "/discover/voices", action: "Descubrir personas" },
      { title: "Contenido", text: "Explora publicaciones, imágenes, vídeo y NFT.", href: "/social", action: "Descubrir contenido" },
      { title: "Categorías", text: "Explora arte, fotografía, música, vídeo, coleccionismo, patrimonio e historias.", href: "/discover/world", action: "Explorar categorías" },
      { title: "Sorpresa", text: "Abre algo inesperado de VIA Discover.", href: "/discover/surprise", action: "Sorpréndeme" },
    ],
    secondary: [
      { title: "Alrededor del mundo", href: "/discover/world" },
      { title: "Nuevas voces", href: "/discover/voices" },
      { title: "NFT", href: "/collection" },
      { title: "Radio mundial", href: "/radio" },
      { title: "Noticias del mundo", href: "/news" },
      { title: "Eventos", href: "/events" },
      { title: "Aprender", href: "/learn" },
      { title: "Muestra lo que haces", href: "/show-your-stuff" },
    ],
  },
  Chinese: {
    title: "发现",
    intro: "在 VIA 和 DeSo 中发现人物、帖子、媒体、NFT 和创意。",
    more: "更多探索",
    primary: [
      { title: "人物", text: "发现 DeSo 上的创作者和账号。", href: "/discover/voices", action: "发现人物" },
      { title: "内容", text: "浏览帖子、图片、视频和 NFT。", href: "/social", action: "发现内容" },
      { title: "分类", text: "探索艺术、摄影、音乐、视频、收藏、文化遗产和故事。", href: "/discover/world", action: "探索分类" },
      { title: "惊喜", text: "从 VIA Discover 打开一个意想不到的内容。", href: "/discover/surprise", action: "给我惊喜" },
    ],
    secondary: [
      { title: "环游世界", href: "/discover/world" },
      { title: "新声音", href: "/discover/voices" },
      { title: "NFT", href: "/collection" },
      { title: "世界电台", href: "/radio" },
      { title: "世界新闻", href: "/news" },
      { title: "活动", href: "/events" },
      { title: "学习", href: "/learn" },
      { title: "展示你的作品", href: "/show-your-stuff" },
    ],
  },
  Hindi: {
    title: "Discover",
    intro: "Find people, posts, media, NFTs and ideas across VIA and DeSo.",
    more: "More to explore",
    primary: [
      { title: "People", text: "Find creators and accounts on DeSo.", href: "/discover/voices", action: "Discover People" },
      { title: "Content", text: "Browse posts, images, video and NFTs.", href: "/social", action: "Discover Content" },
      { title: "Categories", text: "Explore art, photography, music, video, collecting, heritage and stories.", href: "/discover/world", action: "Explore Categories" },
      { title: "Surprise", text: "Open something unexpected from VIA discovery.", href: "/discover/surprise", action: "Surprise Me" },
    ],
    secondary: [
      { title: "Around the World", href: "/discover/world" },
      { title: "New Voices", href: "/discover/voices" },
      { title: "NFTs", href: "/collection" },
      { title: "World Radio", href: "/radio" },
      { title: "The World News", href: "/news" },
      { title: "Events", href: "/events" },
      { title: "Learn", href: "/learn" },
      { title: "Show Your Stuff", href: "/show-your-stuff" },
    ],
  },
}

export default function DiscoverPage() {
  const [language, setLanguage] = useState<ViaLanguage>("English")

  useEffect(() => {
    const refresh = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    refresh()
    window.addEventListener(VIA_SETTINGS_EVENT, refresh)
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, refresh)
  }, [])

  const copy = COPY[language]

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 border-b border-white/10 pb-5">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h1>
          <p className="mt-2 text-sm text-zinc-500 sm:text-base">{copy.intro}</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2" aria-label={copy.title}>
          {copy.primary.map((item) => (
            <article key={item.href} className="rounded-2xl border border-zinc-800 bg-zinc-950/75 p-5">
              <h2 className="text-xl font-medium text-zinc-100">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{item.text}</p>
              <Link href={item.href} className="mt-5 inline-flex rounded-full border border-[#285f40] px-4 py-2 text-sm font-medium text-[#9adbb2] hover:border-[#8fd4a9]/70">
                {item.action}
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-8 border-t border-zinc-900 pt-6" aria-labelledby="discover-more-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="discover-more-heading" className="text-xl font-semibold">{copy.more}</h2>
            <div className="flex flex-wrap gap-2">
              {copy.secondary.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-full border border-zinc-800 px-3.5 py-2 text-sm text-zinc-300 hover:border-[#8fd4a9]/45 hover:text-[#9adbb2]">
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
