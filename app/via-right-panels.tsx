"use client"

import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "./via-local-settings"

type VisitorAnalyticsResponse = {
  ok?: boolean
  measuredAt?: string
  visitors?: { today?: number; month?: number; year?: number }
  countries?: Array<{ country?: string; visitors?: number }>
}

type ActivityAnalyticsResponse = {
  ok?: boolean
  scope?: string
  sampledPosts?: number
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
  sampleNote: string
  retry: string
  noCountries: string
}

const COPY: Record<ViaLanguage | "Hindi", PanelCopy> = {
  Dutch: {
    live: "VIA Live", visitors: "VIA Bezoekers", activity: "VIA Activiteit", community: "VIA Community",
    activeNow: "Nu aanwezig", desoAccounts: "DeSo-accounts", guests: "Zonder DeSo", countries: "Landen", countryCount: "landen", countryVisitors: "bezoekers",
    today: "Vandaag", month: "Deze maand", year: "Start VIA 17-09-2026", posts: "Recente VIA-posts", creators: "Recente VIA-creators",
    trends: "Trends", nftActivity: "Recente VIA-NFT-posts", welcome: "Welcome / First Post", sourcePending: "Betrouwbare meetbron nog niet gekoppeld.",
    sampleNote: "steekproef recente berichten",
    retry: "Opnieuw proberen",
    noCountries: "Geen landen gemeten in deze periode.",
  },
  English: {
    live: "VIA Live", visitors: "VIA Visitors", activity: "VIA Activity", community: "VIA Community",
    activeNow: "Active now", desoAccounts: "DeSo accounts", guests: "Without DeSo", countries: "Countries", countryCount: "countries", countryVisitors: "visitors",
    today: "Today", month: "This month", year: "Start VIA 17-09-2026", posts: "Recent VIA posts", creators: "Recent VIA creators",
    trends: "Trends", nftActivity: "Recent VIA NFT posts", welcome: "Welcome / First Post", sourcePending: "Reliable measurement source not connected yet.",
    sampleNote: "sampled recent posts",
    retry: "Retry",
    noCountries: "No countries measured in this period.",
  },
  French: {
    live: "VIA Live", visitors: "VIA Visiteurs", activity: "VIA Activité", community: "VIA Communauté",
    activeNow: "Présents maintenant", desoAccounts: "Comptes DeSo", guests: "Sans DeSo", countries: "Pays", countryCount: "pays", countryVisitors: "visiteurs",
    today: "Aujourd’hui", month: "Ce mois-ci", year: "Start VIA 17-09-2026", posts: "Publications VIA récentes", creators: "Créateurs VIA récents",
    trends: "Tendances", nftActivity: "Publications NFT VIA récentes", welcome: "Welcome / First Post", sourcePending: "Source de mesure fiable pas encore connectée.",
    sampleNote: "publications récentes échantillonnées",
    retry: "Réessayer",
    noCountries: "Aucun pays mesuré sur cette période.",
  },
  Spanish: {
    live: "VIA Live", visitors: "VIA Visitantes", activity: "VIA Actividad", community: "VIA Comunidad",
    activeNow: "Activos ahora", desoAccounts: "Cuentas DeSo", guests: "Sin DeSo", countries: "Países", countryCount: "países", countryVisitors: "visitantes",
    today: "Hoy", month: "Este mes", year: "Start VIA 17-09-2026", posts: "Publicaciones VIA recientes", creators: "Creadores VIA recientes",
    trends: "Tendencias", nftActivity: "Publicaciones NFT VIA recientes", welcome: "Welcome / First Post", sourcePending: "La fuente de medición fiable aún no está conectada.",
    sampleNote: "publicaciones recientes muestreadas",
    retry: "Reintentar",
    noCountries: "No se registraron países en este período.",
  },
  Chinese: {
    live: "VIA 实时", visitors: "VIA 访客", activity: "VIA 活动", community: "VIA 社区",
    activeNow: "当前在线", desoAccounts: "DeSo 账户", guests: "未使用 DeSo", countries: "国家/地区", countryCount: "个国家/地区", countryVisitors: "位访客",
    today: "今天", month: "本月", year: "Start VIA 17-09-2026", posts: "近期 VIA 帖子", creators: "近期 VIA 创作者",
    trends: "趋势", nftActivity: "近期 VIA NFT 帖子", welcome: "Welcome / First Post", sourcePending: "尚未连接可靠的统计来源。",
    sampleNote: "近期帖子抽样",
    retry: "重试",
    noCountries: "此期间未记录到国家或地区。",
  },
  Hindi: {
    live: "VIA लाइव", visitors: "VIA आगंतुक", activity: "VIA गतिविधि", community: "VIA समुदाय",
    activeNow: "अभी सक्रिय", desoAccounts: "DeSo खाते", guests: "DeSo के बिना", countries: "देश", countryCount: "देश", countryVisitors: "आगंतुक",
    today: "आज", month: "इस महीने", year: "Start VIA 17-09-2026", posts: "हालिया VIA पोस्ट", creators: "हालिया VIA क्रिएटर",
    trends: "रुझान", nftActivity: "हालिया VIA NFT पोस्ट", welcome: "स्वागत / पहली पोस्ट", sourcePending: "विश्वसनीय मापन स्रोत अभी जुड़ा नहीं है।",
    sampleNote: "हालिया पोस्ट का नमूना",
    retry: "फिर कोशिश करें",
    noCountries: "इस अवधि में कोई देश दर्ज नहीं हुआ।",
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
  const [countriesAvailable, setCountriesAvailable] = useState(false)
  const [activityPosts, setActivityPosts] = useState<number | null>(null)
  const [activityCreators, setActivityCreators] = useState<number | null>(null)
  const [activityNfts, setActivityNfts] = useState<number | null>(null)
  const [visitorMeasuredAt, setVisitorMeasuredAt] = useState<string | null>(null)
  const [analyticsError, setAnalyticsError] = useState(false)
  const [activitySampleSize, setActivitySampleSize] = useState<number | null>(null)

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
    // Refresh only after the tab becomes visible again, and at most once
    // per five minutes. Do not poll while the user is away.
    const refreshIntervalMs = 5 * 60 * 1000
    let lastRefresh = 0
    let inFlight = false
    let disposed = false
    const controllers = new Set<AbortController>()

    const refresh = async (force = false) => {
      if (disposed || document.visibilityState === "hidden" || inFlight) return
      const now = Date.now()
      if (!force && now - lastRefresh < refreshIntervalMs) return
      lastRefresh = now
      inFlight = true
      setAnalyticsError(false)
      const visitorController = new AbortController()
      const activityController = new AbortController()
      controllers.add(visitorController)
      controllers.add(activityController)

      const visitors = fetch("/api/via/analytics/visitors", {
        signal: visitorController.signal,
        headers: { Accept: "application/json" },
      }).then(async (response) => {
        if (!response.ok) throw new Error("Visitor analytics unavailable")
        const data = await response.json() as VisitorAnalyticsResponse
        if (disposed || !data.ok || !data.visitors) throw new Error("Visitor analytics unavailable")
        const { today, month, year } = data.visitors
        if (![today, month, year].every((value) => typeof value === "number" && Number.isSafeInteger(value) && value >= 0) ||
          (today as number) > (month as number) || (month as number) > (year as number)) {
          throw new Error("Invalid visitor analytics totals")
        }
        setVisitorToday(today as number)
        setVisitorMonth(month as number)
        setVisitorYear(year as number)
        setVisitorMeasuredAt(typeof data.measuredAt === "string" && Number.isFinite(Date.parse(data.measuredAt)) ? data.measuredAt : null)
        // An unavailable country source must clear previously displayed countries.
        // Never keep an old country list alongside fresh visitor totals.
        setCountriesAvailable(Array.isArray(data.countries))
        setVisitorCountries(Array.isArray(data.countries)
          ? data.countries.filter((entry): entry is { country: string; visitors: number } =>
              Boolean(entry && typeof entry.country === "string" && /^[A-Za-z]{2}$/.test(entry.country) &&
                typeof entry.visitors === "number" && Number.isSafeInteger(entry.visitors) && entry.visitors >= 0),
            )
          : [])
      }).catch(() => {
        if (disposed || visitorController.signal.aborted) return
        setAnalyticsError(true)
        setVisitorToday(null)
        setVisitorMonth(null)
        setVisitorYear(null)
        setVisitorCountries([])
        setCountriesAvailable(false)
        setVisitorMeasuredAt(null)
      }).finally(() => controllers.delete(visitorController))

      const activity = fetch("/api/via/analytics/activity", {
        signal: activityController.signal,
        headers: { Accept: "application/json" },
      }).then(async (response) => {
        if (!response.ok) throw new Error("Activity analytics unavailable")
        const data = await response.json() as ActivityAnalyticsResponse
        if (disposed || !data.ok || data.scope !== "bounded-recent-via-posts") throw new Error("Activity analytics unavailable")
        const sampleSize = data.sampledPosts
        const counts = [data.activity?.posts, data.activity?.creators, data.activity?.nftPosts]
        if (typeof sampleSize !== "number" || !Number.isSafeInteger(sampleSize) || sampleSize < 1 ||
          !counts.every((value) => typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value <= sampleSize) ||
          (counts[1] as number) > (counts[0] as number) || (counts[2] as number) > (counts[0] as number)) {
          throw new Error("Invalid activity sample")
        }
        setActivitySampleSize(sampleSize)
        setActivityPosts(counts[0] as number)
        setActivityCreators(counts[1] as number)
        setActivityNfts(counts[2] as number)
      }).catch(() => {
        if (disposed || activityController.signal.aborted) return
        setAnalyticsError(true)
        setActivityPosts(null)
        setActivityCreators(null)
        setActivityNfts(null)
        setActivitySampleSize(null)
      }).finally(() => controllers.delete(activityController))

      await Promise.all([visitors, activity])
      inFlight = false
    }

    const onReturn = () => { void refresh() }
    const onRetry = () => { void refresh(true) }
    void refresh()
    window.addEventListener("focus", onReturn)
    window.addEventListener("pageshow", onReturn)
    document.addEventListener("visibilitychange", onReturn)
    window.addEventListener("via:analytics-retry", onRetry)
    return () => {
      disposed = true
      controllers.forEach((controller) => controller.abort())
      window.removeEventListener("focus", onReturn)
      window.removeEventListener("pageshow", onReturn)
      document.removeEventListener("visibilitychange", onReturn)
      window.removeEventListener("via:analytics-retry", onRetry)
    }
  }, [])

  const copy = COPY[language]

  return (
    <aside className="space-y-3" aria-label="VIA live and activity panels">
      {analyticsError ? <button type="button" onClick={() => window.dispatchEvent(new Event("via:analytics-retry"))} className="rounded-xl border border-[#285f40] px-3 py-2 text-xs text-[#9adbb2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9adbb2]">{copy.retry}</button> : null}
      <Panel title={copy.live}>
        <PendingMetric label={copy.activeNow} note={copy.sourcePending} />
        <PendingMetric label={copy.desoAccounts} note={copy.sourcePending} />
        <PendingMetric label={copy.guests} note={copy.sourcePending} />
        {countriesAvailable ? (
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
                {visitorCountries.length === 0 ? <p className="py-1 text-zinc-500">{copy.noCountries}</p> : null}
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
        {visitorMeasuredAt ? <p className="text-[10px] text-zinc-500">{new Date(visitorMeasuredAt).toLocaleString(({ Dutch: "nl-NL", English: "en-GB", French: "fr-FR", Spanish: "es-ES", Chinese: "zh-CN", Hindi: "hi-IN" } as const)[language])}</p> : null}
        <Metric label={copy.today} value={visitorToday} note={copy.sourcePending} />
        <Metric label={copy.month} value={visitorMonth} note={copy.sourcePending} />
        <Metric label={copy.year} value={visitorYear} note={copy.sourcePending} />
      </Panel>

      <Panel title={copy.activity}>
        {activitySampleSize !== null ? <p className="text-[10px] text-zinc-500">DeSo · {activitySampleSize} {copy.sampleNote}</p> : null}
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
