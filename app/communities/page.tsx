"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings";

const quietAction = "rounded-[11px] border border-zinc-700/80 bg-transparent px-4 py-2 text-sm text-zinc-300 transition-[background-color,border-color,color] duration-200 ease-out hover:border-[#8fd4a9]/50 hover:bg-[#0c1711]/35 hover:text-[#9adbb2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15";

type CommunityCard = { title: string; text: string };
type CommunityGroup = { title: string; intro: string; cards: CommunityCard[] };
type Copy = { kicker: string; heading: string; intro: string; back: string; foundation: string; foundationText: string; groups: CommunityGroup[] };

const copy: Record<ViaLanguage, Copy> = {
  Dutch: {
    kicker: "VIA · COMMUNITY",
    heading: "Communities",
    intro: "Gerichte ruimtes voor mensen die elkaar rond hetzelfde onderwerp willen vinden, zonder ieder gesprek in één algemene feed te duwen.",
    back: "Terug naar Mijn VIA",
    foundation: "Basis van Communities",
    foundationText: "Deelnemen, posten, lidmaatschap, zichtbaarheid en moderatie verschijnen pas wanneer ze door een gecontroleerde DeSo-compatibele implementatie worden ondersteund. VIA toont geen lokale browserkeuze alsof die echt community-lidmaatschap is.",
    groups: [
      { title: "Creatief & cultuur", intro: "Kunst, beeld, muziek en makers bij elkaar.", cards: [
        { title: "Kunst & fotografie", text: "Creators, verzamelaars en bezoekers rond beeldend werk en cultuur." },
        { title: "Muziek", text: "Muziek ontdekken, bespreken en later koppelen aan VIA LIVE-sessies." },
      ] },
      { title: "DeSo & verzamelen", intro: "Techniek, creators en digitale verzamelingen.", cards: [
        { title: "DeSo & builders", text: "DeSo, creator-tools en platformontwikkeling op één gerichte plek." },
        { title: "NFT & verzamelen", text: "Collecties, releases, verzamelen en gesprekken over NFT's." },
      ] },
      { title: "Spelen & ontmoeten", intro: "Lichter contact, games en brede gesprekken.", cards: [
        { title: "Games & Quest", text: "VIA World Quest, casual games en bijbehorende community-activiteit." },
        { title: "Open community", text: "Een brede openbare ruimte voor gesprek, ideeën en ontdekking." },
      ] },
    ],
  },
  English: {
    kicker: "VIA · COMMUNITY",
    heading: "Communities",
    intro: "Focused spaces for people who want to meet around the same subject without pushing every conversation into one global feed.",
    back: "Back to My VIA",
    foundation: "Community foundation",
    foundationText: "Joining, posting, membership, visibility and moderation controls only appear when backed by a reviewed DeSo-compatible implementation. VIA does not show local browser choices as if they were real community membership.",
    groups: [
      { title: "Creative & culture", intro: "Art, images, music and makers together.", cards: [
        { title: "Art & Photography", text: "Creators, collectors and visitors around visual work and culture." },
        { title: "Music", text: "Music discovery, discussion and future VIA LIVE sessions." },
      ] },
      { title: "DeSo & collecting", intro: "Technology, creators and digital collections.", cards: [
        { title: "DeSo & Builders", text: "DeSo, creator tools and platform development in one focused place." },
        { title: "NFT & Collecting", text: "Collections, releases, collecting and NFT discussion." },
      ] },
      { title: "Play & meet", intro: "Lighter contact, games and broad conversation.", cards: [
        { title: "Games & Quest", text: "VIA World Quest, casual games and related community activity." },
        { title: "Open Community", text: "A broad public space for conversation, ideas and discovery." },
      ] },
    ],
  },
  French: {
    kicker: "VIA · COMMUNAUTÉ",
    heading: "Communautés",
    intro: "Des espaces ciblés pour se retrouver autour d'un même sujet sans tout mélanger dans un seul fil général.",
    back: "Retour à Mon VIA",
    foundation: "Base des communautés",
    foundationText: "Participation, publication, adhésion, visibilité et modération n'apparaissent que lorsqu'une implémentation compatible DeSo a été vérifiée. VIA ne présente pas un choix local du navigateur comme une véritable adhésion.",
    groups: [
      { title: "Création & culture", intro: "Art, image, musique et créateurs.", cards: [
        { title: "Art & photographie", text: "Créateurs, collectionneurs et visiteurs autour des œuvres visuelles et de la culture." },
        { title: "Musique", text: "Découverte musicale, échanges et futures sessions VIA LIVE." },
      ] },
      { title: "DeSo & collection", intro: "Technologie, créateurs et collections numériques.", cards: [
        { title: "DeSo & builders", text: "DeSo, outils de création et développement de plateforme en un seul endroit." },
        { title: "NFT & collection", text: "Collections, sorties, collection et échanges autour des NFT." },
      ] },
      { title: "Jeux & rencontres", intro: "Jeux, détente et conversations ouvertes.", cards: [
        { title: "Jeux & Quest", text: "VIA World Quest, jeux casual et activité communautaire associée." },
        { title: "Communauté ouverte", text: "Un espace public large pour les conversations, les idées et la découverte." },
      ] },
    ],
  },
  Spanish: {
    kicker: "VIA · COMUNIDAD",
    heading: "Comunidades",
    intro: "Espacios centrados para encontrarse alrededor de un mismo tema sin empujar todas las conversaciones a un único feed global.",
    back: "Volver a Mi VIA",
    foundation: "Base de Communities",
    foundationText: "Participación, publicación, membresía, visibilidad y moderación solo aparecen cuando están respaldadas por una implementación compatible con DeSo y revisada. VIA no presenta una elección local del navegador como una membresía real.",
    groups: [
      { title: "Creatividad & cultura", intro: "Arte, imagen, música y creadores.", cards: [
        { title: "Arte & fotografía", text: "Creadores, coleccionistas y visitantes alrededor del trabajo visual y la cultura." },
        { title: "Música", text: "Descubrimiento musical, conversación y futuras sesiones VIA LIVE." },
      ] },
      { title: "DeSo & colección", intro: "Tecnología, creadores y colecciones digitales.", cards: [
        { title: "DeSo & builders", text: "DeSo, herramientas para creadores y desarrollo de plataforma en un lugar enfocado." },
        { title: "NFT & colección", text: "Colecciones, lanzamientos, coleccionismo y conversación sobre NFT." },
      ] },
      { title: "Jugar & conocer", intro: "Juegos, contacto ligero y conversación abierta.", cards: [
        { title: "Games & Quest", text: "VIA World Quest, juegos casuales y actividad comunitaria relacionada." },
        { title: "Comunidad abierta", text: "Un espacio público amplio para conversaciones, ideas y descubrimiento." },
      ] },
    ],
  },
  Chinese: {
    kicker: "VIA · 社区",
    heading: "社区",
    intro: "围绕共同主题建立清晰空间，不把所有交流都挤进同一个全局信息流。",
    back: "返回我的 VIA",
    foundation: "社区基础",
    foundationText: "加入、发帖、成员身份、可见性和管理功能，仅在经过审核并兼容 DeSo 的实现可用时显示。VIA 不会把本地浏览器选择伪装成真实社区成员关系。",
    groups: [
      { title: "创作与文化", intro: "艺术、影像、音乐与创作者。", cards: [
        { title: "艺术与摄影", text: "围绕视觉作品与文化的创作者、收藏者和访客。" },
        { title: "音乐", text: "发现音乐、交流，并为未来 VIA LIVE 会话做准备。" },
      ] },
      { title: "DeSo 与收藏", intro: "技术、创作者和数字收藏。", cards: [
        { title: "DeSo 与开发者", text: "把 DeSo、创作者工具与平台开发集中在一个清晰空间。" },
        { title: "NFT 与收藏", text: "围绕收藏、发行、收集和 NFT 展开交流。" },
      ] },
      { title: "游戏与交流", intro: "轻松互动、游戏和开放交流。", cards: [
        { title: "游戏与 Quest", text: "VIA World Quest、休闲游戏及相关社区活动。" },
        { title: "开放社区", text: "用于交流、想法和发现的广泛公共空间。" },
      ] },
    ],
  },
};

export default function CommunitiesPage() {
  const [language, setLanguage] = useState<ViaLanguage>("English");

  useEffect(() => {
    const refreshLanguage = () => setLanguage(readViaLocalSettings().interfaceLanguage);
    refreshLanguage();
    window.addEventListener(VIA_SETTINGS_EVENT, refreshLanguage);
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, refreshLanguage);
  }, []);

  const t = copy[language];

  return (
    <main className="min-h-screen bg-[#050807] px-5 py-8 text-zinc-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-9 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">{t.kicker}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.25rem]">{t.heading}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">{t.intro}</p>
          </div>
          <Link href="/my-via" className={quietAction}>{t.back}</Link>
        </header>

        <div className="grid gap-7">
          {t.groups.map((group) => (
            <section key={group.title}>
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-zinc-100">{group.title}</h2>
                <p className="mt-1 text-sm text-zinc-500">{group.intro}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {group.cards.map((community) => (
                  <article key={community.title} className="rounded-[14px] border border-zinc-800/80 bg-zinc-950/50 p-5">
                    <h3 className="text-lg font-medium text-zinc-100">{community.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{community.text}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-[14px] border border-zinc-800/80 bg-zinc-950/35 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">{t.foundation}</p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">{t.foundationText}</p>
        </section>
      </div>
    </main>
  );
}
