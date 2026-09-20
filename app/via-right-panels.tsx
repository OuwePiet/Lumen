"use client"

import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "./via-local-settings"

type VisitorAnalyticsResponse = {
  ok?: boolean
  visitors?: { today?: number; month?: number; year?: number }
  countries?: Array<{ country?: string; visitors?: number }>
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

const COPY: Record<ViaLanguage, PanelCopy> = {
  Dutch: {
    live: "VIA Live", visitors: "VIA Bezoekers", activity: "VIA Activiteit", community: "VIA Community",
    activeNow: "Nu aanwezig", desoAccounts: "DeSo-accounts", guests: "Zonder DeSo", countries: "Landen",
    today: "Vandaag", month: "Deze maand", year: "Dit jaar", posts: "Posts", creators: "Actieve creators",
    trends: "Trends", nftActivity: "NFT-activiteit", welcome: "Welcome / First Post", sourcePending: "Betrouwbare meetbron nog niet gekoppeld.",
  },
  English: {
    live: "VIA Live", visitors: "VIA Visitors", activity: "VIA Activity", community: "VIA Community",
    activeNow: "Active now", desoAccounts: "DeSo accounts", guests: "Without DeSo", countries: "Countries",
    today: "Today", month: "This month", year: "This year", posts: "Posts", creators: "Active creators",
    trends: "Trends", nftActivity: "NFT activity", welcome: "Welcome / First Post", sourcePending: "Reliable measurement source not connected yet.",
  },
  French: {
    live: "VIA Live", visitors: "VIA Visiteurs", activity: "VIA Activité", community: "VIA Communauté",
    activeNow: "Présents maintenant", desoAccounts: "Comptes DeSo", guests: "Sans DeSo", countries: "Pays",
    today: "Aujourd’hui", month: "Ce mois-ci", year: "Cette année", posts: "Publications", creators: "Créateurs actifs",
    trends: "Tendances", nftActivity: "Activité NFT", welcome: "Welcome / First Post", sourcePending: "Source de mesure fiable pas encore connectée.",
  },
  Spanish: {
    live: "VIA Live", visitors: "VIA Visitantes", activity: "VIA Actividad", community: "VIA Comunidad",
    activeNow: "Activos ahora", desoAccounts: "Cuentas DeSo", guests: "Sin DeSo", countries: "Países",
    today: "Hoy", month: "Este mes", year: "Este año", posts: "Publicaciones", creators: "Creadores activos",
    trends: "Tendencias", nftActivity: "Actividad NFT", welcome: "Welcome / First Post", sourcePending: "La fuente de medición fiable aún no está conectada.",
  },
  Chinese: {
    live: "VIA 实时", visitors: "VIA 访客", activity: "VIA 活动", community: "VIA 社区",
    activeNow: "当前在线", desoAccounts: "DeSo 账户", guests: "未使用 DeSo", countries: "国家/地区",
    today: "今天", month: "本月", year: "今年", posts: "帖子", creators: "活跃创作者",
    trends: "趋势", nftActivity: "NFT 活动", welcome: "Welcome / First Post", sourcePending: "尚未连接可靠的统计来源。",
  },
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
  const [visitorToday, setVisitorToday] = useState<number | null>(null)
  const [visitorMonth, setVisitorMonth] = useState<number | null>(null)
  const [visitorYear, setVisitorYear] = useState<number | null>(null)
  const [visitorCountries, setVisitorCountries] = useState<Array<{ country: string; visitors: number }>>([])

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
            .slice(0, 12))
        }
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
          <div className="rounded-xl border border-zinc-800 bg-black/25 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-zinc-300">{copy.countries}</span>
              <span className="text-[10px] text-zinc-600">{visitorCountries.length}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {visitorCountries.map((entry) => (
                <span key={entry.country} className="rounded-full border border-[#285f40]/70 bg-[#07100b] px-2 py-1 text-[10px] text-[#b8ddc5]">
                  {entry.country} {entry.visitors.toLocaleString()}
                </span>
              ))}
            </div>
          </div>
        ) : <PendingMetric label={copy.countries} note={copy.sourcePending} />}
      </Panel>

      <Panel title={copy.visitors}>
        <Metric label={copy.today} value={visitorToday} note={copy.sourcePending} />
        <Metric label={copy.month} value={visitorMonth} note={copy.sourcePending} />
        <Metric label={copy.year} value={visitorYear} note={copy.sourcePending} />
      </Panel>

      <Panel title={copy.activity}>
        <PendingMetric label={copy.posts} note={copy.sourcePending} />
        <PendingMetric label={copy.creators} note={copy.sourcePending} />
        <PendingMetric label={copy.trends} note={copy.sourcePending} />
        <PendingMetric label={copy.nftActivity} note={copy.sourcePending} />
      </Panel>

      <Panel title={copy.community}>
        <PendingMetric label={copy.welcome} note={copy.sourcePending} />
      </Panel>
    </aside>
  )
}
