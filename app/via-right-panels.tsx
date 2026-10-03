"use client"

import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "./via-local-settings"

type VisitorAnalyticsResponse = {
  ok?: boolean
  visitors?: { today?: number; month?: number; year?: number }
  countries?: Array<{ country?: string; visitors?: number }>
}

type ActivityAnalyticsResponse = {
  ok?: boolean
  scope?: string
  activity?: { posts?: number; creators?: number; nftPosts?: number }
}

type PanelCopy = {
  live: string
  visitors: string
  activity: string
  community: string
  activeNow: string
  desoAccounts: string
  guests: string
  countries: string
  countryCount: string
  countryVisitors: string
  today: string
  month: string
  year: string
  posts: string
  creators: string
  trends: string
  nftActivity: string
  welcome: string
  sourcePending: string
}

const COPY: Record<ViaLanguage | "Hindi", PanelCopy> = {
  Dutch: {
    live: "VIA Live", visitors: "VIA Bezoekers", activity: "VIA Activiteit", community: "VIA Community",
    activeNow: "Nu aanwezig", desoAccounts: "DeSo-accounts", guests: "Zonder DeSo", countries: "Landen", countryCount: "landen", countryVisitors: "bezoekers",
    today: "Vandaag", month: "Deze maand", year: "Start VIA 17-09-2026", posts: "Recente VIA-posts", creators: "Recente VIA-creators",
    trends: "Trends", nftActivity: "Recente VIA-NFT-posts", welcome: "Welcome / First Post", sourcePending: "Betrouwbare meetbron nog niet gekoppeld.",
  },
  English: {
    live: "VIA Live", visitors: "VIA Visitors", activity: "VIA Activity", community: "VIA Community",
    activeNow: "Active now", desoAccounts: "DeSo accounts", guests: "Without DeSo", countries: "Countries", countryCount: "countries", countryVisitors: "visitors",
    today: "Today", month: "This month", year: "Start VIA 17-09-2026", posts: "Recent VIA posts", creators: "Recent VIA creators",
    trends: "Trends", nftActivity: "Recent VIA NFT posts", welcome: "Welcome / First Post", sourcePending: "Reliable measurement source not connected yet.",
  },
  French: {
    live: "VIA Live", visitors: "VIA Visiteurs", activity: "VIA Activité", community: "VIA Communauté",
    activeNow: "Présents maintenant", desoAccounts: "Comptes DeSo", guests: "Sans DeSo", countries: "Pays", countryCount: "pays", countryVisitors: "visiteurs",
    today: "Aujourd’hui", month: "Ce mois-ci", year: "Start VIA 17-09-2026", posts: "Publications VIA récentes", creators: "Créateurs VIA récents",
    trends: "Tendances", nftActivity: "Publications NFT VIA récentes", welcome: "Welcome / First Post", sourcePending: "Source de mesure fiable pas encore connectée.",
  },
  Spanish: {
    live: "VIA Live", visitors: "VIA Visitantes", activity: "VIA Actividad", community: "VIA Comunidad",
    activeNow: "Activos ahora", desoAccounts: "Cuentas DeSo", guests: "Sin DeSo", countries: "Países", countryCount: "países", countryVisitors: "visitantes",
    today: "Hoy", month: "Este mes", year: "Start VIA 17-09-2026", posts: "Publicaciones VIA recientes", creators: "Creadores VIA recientes",
    trends: "Tendencias", nftActivity: "Publicaciones NFT VIA recientes", welcome: "Welcome / First Post", sourcePending: "La fuente de medición fiable aún no está conectada.",
  },
  Chinese: {
    live: "VIA 实时", visitors: "VIA 访客", activity: "VIA 活动", community: "VIA 社区",
    activeNow: "当前在线", desoAccounts: "DeSo 账户", guests: "未使用 DeSo", countries: "国家/地区", countryCount: "个国家/地区", countryVisitors: "位访客",
    today: "今天", month: "本月", year: "Start VIA 17-09-2026", posts: "近期 VIA 帖子", creators: "近期 VIA 创作者",
    trends: "趋势", nftActivity: "近期 VIA NFT 帖子", welcome: "Welcome / First Post", sourcePending: "尚未连接可靠的统计来源。",
  },
  Hindi: {
    live: "VIA लाइव", visitors: "VIA आगंतुक", activity: "VIA गतिविधि", community: "VIA समुदाय",
    activeNow: "अभी सक्रिय", desoAccounts: "DeSo खाते", guests: "DeSo के बिना", countries: "देश", countryCount: "देश", countryVisitors: "आगंतुक",
    today: "आज", month: "इस महीने", year: "Start VIA 17-09-2026", posts: "हालिया VIA पोस्ट", creators: "हालिया VIA क्रिएटर",
    trends: "रुझान", nftActivity: "हालिया VIA NFT पोस्ट", welcome: "स्वागत / पहली पोस्ट", sourcePending: "विश्वसनीय मापन स्रोत अभी जुड़ा नहीं है।",
  },
}

function countryFlag(code: string) {
  const normalized = code.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(normalized)) return ""
  return String.fromCodePoint(...normalized.split("").map((char) => 127397 + char.charCodeAt(0)))
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#285f40]/70 bg-[#050806]/90 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
      <h2 className="text-sm font-semibold tracking-wide text-[#9adbb2]">{title}</h2>
      <div className="mt-3 space-y-2 text-xs text-zinc-400">{children}</div>
    </section>
  )
}

function Metric({ label, value, note }: { label: string; value: number | null; note: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-black/25 px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-zinc-300">{label}</span>
        <span className={value === null ? "text-zinc-600" : "font-semibold text-[#9adbb2]"}>{value === null ? "—" : value.toLocaleString()}</span>
      </div>
      {value === null ? <p className="mt-1 text-[10px] leading-4 text-zinc-600">{note}</p> : null}
    </div>
  )
}

function PendingMetric({ label, note }: { label: string; note: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-black/25 px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-zinc-300">{label}</span>
        <span className="text-zinc-600">—</span>
      </div>
      <p className="mt-1 text-[10px] leading-4 text-zinc-600">{note}</p>
    </div>
  )
}

export default function ViaRightPanels() {
  const [language, setLanguage] = useState<ViaLanguage>("English")
  const [countriesExpanded, setCountriesExpanded] = useState(false)
  const [visitorToday, setVisitorToday] = useState<number | null>(null)
  const [visitorMonth, setVisitorMonth] = useState<number | null>(null)
  const [visitorYear, setVisitorYear] = useState<number | null>(null)
  const [visitorCountries, setVisitorCountries] = useState<Array<{ country: string; visitors: number }>>([])
  const [activityPosts, setActivityPosts] = useState<number | null>(null)
  const [activityCreators, setActivityCreators] = useState<number | null>(null)
  const [activityNfts, setActivityNfts] = useState<number | null>(null)

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

  useEffect(() => {
    const controller = new AbortController()
    void fetch("/api/via/analytics/visitors", {
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const data = await response.json() as VisitorAnalyticsResponse
        if (!response.ok || !data.ok || !data.visitors) return
        if (typeof data.visitors.today === "number" && Number.isFinite(data.visitors.today)) setVisitorToday(data.visitors.today)
        if (typeof data.visitors.month === "number" && Number.isFinite(data.visitors.month)) setVisitorMonth(data.visitors.month)
        if (typeof data.visitors.year === "number" && Number.isFinite(data.visitors.year)) setVisitorYear(data.visitors.year)
        if (Array.isArray(data.countries)) {
          setVisitorCountries(data.countries
            .filter((entry): entry is { country: string; visitors: number } => Boolean(entry && typeof entry.country === "string" && typeof entry.visitors === "number" && Number.isFinite(entry.visitors)))
             )
        }
      })
      .catch(() => {})

    return () => controller.abort()
  }, [])


  useEffect(() => {
    const controller = new AbortController()
    void fetch("/api/via/analytics/activity", {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) return
        const data = await response.json() as ActivityAnalyticsResponse
        if (!data.ok || data.scope !== "bounded-recent-via-posts") return
        if (typeof data.activity?.posts === "number") setActivityPosts(data.activity.posts)
        if (typeof data.activity?.creators === "number") setActivityCreators(data.activity.creators)
        if (typeof data.activity?.nftPosts === "number") setActivityNfts(data.activity.nftPosts)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [])

  const copy = COPY[language]

  return (
    <aside className="space-y-3" aria-label="VIA live and activity panels">
      <Panel title={copy.live}>
        <PendingMetric label={copy.activeNow} note={copy.sourcePending} />
        <PendingMetric label={copy.desoAccounts} note={copy.sourcePending} />
        <PendingMetric label={copy.guests} note={copy.sourcePending} />
        {visitorCountries.length ? (
          <div className="rounded-xl border border-zinc-800 bg-black/25">
            <button type="button" aria-expanded={countriesExpanded} aria-controls="via-countries-list"
              onClick={() => setCountriesExpanded((open) => !open)}
              className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9adbb2]">
              <span className="text-zinc-300">{copy.countries}</span>
              <span className="flex items-center gap-2 text-[#9adbb2]">
                {visitorCountries.length} {copy.countryCount}
                <span aria-hidden="true">{countriesExpanded ? "⌃" : "⌄"}</span>
              </span>
            </button>
            {countriesExpanded ? (
              <div id="via-countries-list" className="max-h-52 space-y-1 overflow-y-auto border-t border-zinc-800 px-3 py-2">
                {visitorCountries.map((entry) => (
                  <div key={entry.country} className="flex items-center justify-between gap-2 py-1 text-zinc-300">
                    <span>{countryFlag(entry.country)} {entry.country}</span>
                    <span className="text-[#9adbb2]">{entry.visitors.toLocaleString()} {copy.countryVisitors}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : <PendingMetric label={copy.countries} note={copy.sourcePending} />}
      </Panel>

      <Panel title={copy.visitors}>
        <Metric label={copy.today} value={visitorToday} note={copy.sourcePending} />
        <Metric label={copy.month} value={visitorMonth} note={copy.sourcePending} />
        <Metric label={copy.year} value={visitorYear} note={copy.sourcePending} />
      </Panel>

      <Panel title={copy.activity}>
        <Metric label={copy.posts} value={activityPosts} note={copy.sourcePending} />
        <Metric label={copy.creators} value={activityCreators} note={copy.sourcePending} />
        <PendingMetric label={copy.trends} note={copy.sourcePending} />
        <Metric label={copy.nftActivity} value={activityNfts} note={copy.sourcePending} />
      </Panel>

      <Panel title={copy.community}>
        <PendingMetric label={copy.welcome} note={copy.sourcePending} />
      </Panel>
    </aside>
  )
}
