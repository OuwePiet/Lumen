"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CreatorQuickMenu from "./creator-quick-menu";
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../via-local-settings";

type Copy = {
  kicker: string;
  heading: string;
  intro: string;
  back: string;
  footer: string;
  cards: Array<{ title: string; text: string; href: string; action: string }>;
};

const copy: Record<ViaLanguage, Copy> = {
  Dutch: {
    kicker: "VIA · PERSOONLIJK",
    heading: "Mijn VIA",
    intro: "Je persoonlijke VIA-omgeving voor account, NFT's, opgeslagen werk, concepten, instellingen en creator-snelkoppelingen.",
    back: "Terug naar VIA",
    footer: "Lezen, Luisteren, Ontdekken, Live, Communities en andere VIA-bestemmingen blijven in de algemene navigatie en worden hier niet dubbel weergegeven.",
    cards: [
      { title: "Profiel", text: "Open je ingelogde openbare DeSo-profiel binnen VIA.", href: "/profile", action: "Open profiel" },
      { title: "Wallet", text: "Bekijk het alleen-lezen DESO-saldo van je gekoppelde DeSo-account.", href: "/wallet", action: "Open wallet" },
      { title: "NFT's", text: "Open VIA Collection om DeSo NFT's en creatorcollecties te bekijken.", href: "/collection", action: "Open NFT's" },
      { title: "Opgeslagen", text: "Ga terug naar posts en inhoud die je bewust hebt opgeslagen.", href: "/saved", action: "Open opgeslagen" },
      { title: "Concepten", text: "Ga verder met lokale creatorconcepten in VIA Studio.", href: "/studio#drafts", action: "Open concepten" },
      { title: "Instellingen", text: "Kies lokale creatorinstellingen en beheer lokale Studio-conceptgegevens.", href: "/settings", action: "Open instellingen" },
    ],
  },
  English: {
    kicker: "VIA · PERSONAL",
    heading: "My VIA",
    intro: "Your personal VIA hub for account, NFTs, saved work, drafts, settings and creator shortcuts.",
    back: "Back to VIA",
    footer: "Read, Listen, Discover, Live, Communities and other VIA destinations remain in the global navigation instead of being duplicated here.",
    cards: [
      { title: "Profile", text: "Open your signed-in public DeSo profile inside VIA.", href: "/profile", action: "Open Profile" },
      { title: "Wallet", text: "See the read-only DESO balance for your connected DeSo account.", href: "/wallet", action: "Open Wallet" },
      { title: "NFTs", text: "Open VIA Collection to browse DeSo NFTs and creator collections.", href: "/collection", action: "Open NFTs" },
      { title: "Saved", text: "Return to posts and content you explicitly saved.", href: "/saved", action: "Open Saved" },
      { title: "Drafts", text: "Continue local creator drafts inside VIA Studio.", href: "/studio#drafts", action: "Open Drafts" },
      { title: "Settings", text: "Choose local creator defaults and manage local Studio draft data.", href: "/settings", action: "Open Settings" },
    ],
  },
  French: {
    kicker: "VIA · PERSONNEL",
    heading: "Mon VIA",
    intro: "Votre espace VIA personnel pour le compte, les NFT, les éléments enregistrés, les brouillons, les réglages et les raccourcis créateur.",
    back: "Retour à VIA",
    footer: "Lecture, Écoute, Découverte, Live, Communautés et les autres destinations VIA restent dans la navigation générale afin d'éviter les doublons.",
    cards: [
      { title: "Profil", text: "Ouvrez votre profil DeSo public connecté dans VIA.", href: "/profile", action: "Ouvrir le profil" },
      { title: "Wallet", text: "Consultez le solde DESO en lecture seule de votre compte DeSo connecté.", href: "/wallet", action: "Ouvrir le wallet" },
      { title: "NFT", text: "Ouvrez VIA Collection pour parcourir les NFT DeSo et les collections de créateurs.", href: "/collection", action: "Ouvrir les NFT" },
      { title: "Enregistrés", text: "Retrouvez les publications et contenus que vous avez enregistrés.", href: "/saved", action: "Ouvrir les éléments enregistrés" },
      { title: "Brouillons", text: "Continuez vos brouillons locaux dans VIA Studio.", href: "/studio#drafts", action: "Ouvrir les brouillons" },
      { title: "Réglages", text: "Choisissez vos préférences créateur locales et gérez les données locales de brouillon Studio.", href: "/settings", action: "Ouvrir les réglages" },
    ],
  },
  Spanish: {
    kicker: "VIA · PERSONAL",
    heading: "Mi VIA",
    intro: "Tu espacio personal de VIA para cuenta, NFT, contenido guardado, borradores, ajustes y accesos rápidos de creador.",
    back: "Volver a VIA",
    footer: "Leer, Escuchar, Descubrir, Live, Comunidades y otros destinos de VIA permanecen en la navegación global para evitar duplicados.",
    cards: [
      { title: "Perfil", text: "Abre tu perfil público de DeSo conectado dentro de VIA.", href: "/profile", action: "Abrir perfil" },
      { title: "Wallet", text: "Consulta el saldo DESO de solo lectura de tu cuenta DeSo conectada.", href: "/wallet", action: "Abrir wallet" },
      { title: "NFT", text: "Abre VIA Collection para explorar NFT de DeSo y colecciones de creadores.", href: "/collection", action: "Abrir NFT" },
      { title: "Guardados", text: "Vuelve a publicaciones y contenido que hayas guardado expresamente.", href: "/saved", action: "Abrir guardados" },
      { title: "Borradores", text: "Continúa tus borradores locales de creador en VIA Studio.", href: "/studio#drafts", action: "Abrir borradores" },
      { title: "Ajustes", text: "Elige preferencias locales de creador y gestiona los datos locales de borradores de Studio.", href: "/settings", action: "Abrir ajustes" },
    ],
  },
  Chinese: {
    kicker: "VIA · 个人",
    heading: "我的 VIA",
    intro: "你的个人 VIA 空间，用于账户、NFT、已保存内容、草稿、设置和创作者快捷入口。",
    back: "返回 VIA",
    footer: "阅读、收听、发现、直播、社区及其他 VIA 入口保留在全局导航中，避免重复显示。",
    cards: [
      { title: "个人资料", text: "在 VIA 中打开你当前登录的公开 DeSo 个人资料。", href: "/profile", action: "打开个人资料" },
      { title: "钱包", text: "查看已连接 DeSo 账户的只读 DESO 余额。", href: "/wallet", action: "打开钱包" },
      { title: "NFT", text: "打开 VIA Collection 浏览 DeSo NFT 和创作者收藏。", href: "/collection", action: "打开 NFT" },
      { title: "已保存", text: "返回你明确保存的帖子和内容。", href: "/saved", action: "打开已保存" },
      { title: "草稿", text: "在 VIA Studio 中继续本地创作者草稿。", href: "/studio#drafts", action: "打开草稿" },
      { title: "设置", text: "选择本地创作者默认项并管理 Studio 本地草稿数据。", href: "/settings", action: "打开设置" },
    ],
  },
};

const action = "inline-flex min-h-11 items-center justify-center rounded-[12px] border border-[#8fd4a9]/45 bg-transparent px-4 py-2 text-sm font-semibold text-[#9adbb2] transition-[background-color,border-color] hover:border-[#8fd4a9]/70 hover:bg-[#0c1711]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/20";
const quietAction = "inline-flex min-h-10 items-center rounded-[10px] border border-zinc-700/80 bg-transparent px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-[#8fd4a9]/50 hover:text-[#9adbb2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd4a9]/15";

export default function MyViaPage() {
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
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd4a9]">{t.kicker}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.25rem]">{t.heading}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">{t.intro}</p>
          </div>
          <Link href="/" className={quietAction}>{t.back}</Link>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.cards.map((item) => (
            <article key={item.href} className="rounded-[14px] border border-zinc-800/80 bg-zinc-950/50 p-5">
              <h2 className="text-xl font-medium text-zinc-100">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{item.text}</p>
              <Link href={item.href} className={`${action} mt-5`}>{item.action}</Link>
            </article>
          ))}
        </section>

        <CreatorQuickMenu />

        <p className="mt-8 text-xs leading-5 text-zinc-600">{t.footer}</p>
      </div>
    </main>
  );
}
