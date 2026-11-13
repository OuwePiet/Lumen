"use client"

import { useEffect, useState } from "react"
import { useAnalyticsSnapshot } from "./use-analytics-snapshot"
import { measuredCount } from "../lib/via/analytics-counts"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "./via-local-settings"

type SnapshotMetadata = { ok?: boolean; measuredAt?: string; error?: string | null }
type VisitorAnalyticsResponse = SnapshotMetadata & { visitors?: { today?: number | null; month?: number | null; year?: number | null }; activeNow?: number | null; countries?: Array<{ country: string; visitors: number }>; countriesAvailable?: boolean; countriesComplete?: boolean; warnings?: string[]; periods?: { today?: { since: string }; month?: { since: string }; active?: { since: string } } }
type ActivityAnalyticsResponse = SnapshotMetadata & { scope?: string; sampledPosts?: number; activity?: { posts?: number; creators?: number; nftPosts?: number }; trends?: Array<{ tag: string; count: number }>; recentCreators?: Array<{ publicKey: string; username: string }> }

const META = {"Dutch":{"refresh":"Verversen","loading":"Verversen…","updated":"Bijgewerkt","unavailable":"Bron niet beschikbaar","stale":"Laatste geldige meting; verversen mislukt.","notMeasured":"Nog geen betrouwbare meetbron voor dit gegeven.","activeWindow":"Bezoekers in de laatste 5 minuten","sample":"Steekproef","timezone":"Meetperiode: UTC","emptyTrends":"Geen hashtags in deze steekproef.","firstUnknown":"Eerste posts zijn niet vast te stellen uit deze steekproef.","conflict":"De broncijfers spreken elkaar tegen; onzekere waarden blijven leeg.","accessDenied":"De bezoekersbron weigert toegang (403).","recentCreators":"Recente VIA-makers"},"English":{"refresh":"Refresh","loading":"Refreshing…","updated":"Updated","unavailable":"Source unavailable","stale":"Last valid measurement; refresh failed.","notMeasured":"No reliable measurement source for this field yet.","activeWindow":"Visitors in the last 5 minutes","sample":"Sample","timezone":"Measurement window: UTC","emptyTrends":"No hashtags in this sample.","firstUnknown":"First posts cannot be established from this sample.","conflict":"Source counts conflict; uncertain values remain unavailable.","accessDenied":"Visitor source access denied (403).","recentCreators":"Recent VIA creators"},"French":{"refresh":"Actualiser","loading":"Actualisation…","updated":"Mis à jour","unavailable":"Source indisponible","stale":"Dernière mesure valide ; actualisation échouée.","notMeasured":"Aucune source fiable pour cette mesure.","activeWindow":"Visiteurs des 5 dernières minutes","sample":"Échantillon","timezone":"Période de mesure : UTC","emptyTrends":"Aucun hashtag dans cet échantillon.","firstUnknown":"Cet échantillon ne permet pas d’identifier les premières publications.","conflict":"Les chiffres se contredisent ; les valeurs incertaines restent vides.","accessDenied":"Accès aux statistiques refusé (403).","recentCreators":"Créateurs VIA récents"},"Spanish":{"refresh":"Actualizar","loading":"Actualizando…","updated":"Actualizado","unavailable":"Fuente no disponible","stale":"Última medición válida; actualización fallida.","notMeasured":"Aún no hay una fuente fiable para este dato.","activeWindow":"Visitantes en los últimos 5 minutos","sample":"Muestra","timezone":"Periodo de medición: UTC","emptyTrends":"Sin etiquetas en esta muestra.","firstUnknown":"La muestra no permite identificar las primeras publicaciones.","conflict":"Las cifras no coinciden; los valores dudosos quedan vacíos.","accessDenied":"Acceso a estadísticas denegado (403).","recentCreators":"Creadores VIA recientes"},"Chinese":{"refresh":"刷新","loading":"正在刷新…","updated":"更新时间","unavailable":"数据源不可用","stale":"显示上次有效测量；刷新失败。","notMeasured":"该数据尚无可靠的测量来源。","activeWindow":"最近5分钟的访客","sample":"样本","timezone":"统计时段：UTC","emptyTrends":"此样本中没有话题标签。","firstUnknown":"此样本无法确定首次发帖。","conflict":"来源数据不一致；不确定的数值留空。","accessDenied":"访客数据访问被拒绝（403）。","recentCreators":"近期VIA创作者"},"Hindi":{"refresh":"रीफ़्रेश करें","loading":"रीफ़्रेश हो रहा है…","updated":"अपडेट","unavailable":"स्रोत उपलब्ध नहीं","stale":"पिछला मान्य माप; रीफ़्रेश विफल हुआ।","notMeasured":"इस आँकड़े के लिए विश्वसनीय स्रोत अभी नहीं है।","activeWindow":"पिछले 5 मिनट के आगंतुक","sample":"नमूना","timezone":"मापन अवधि: UTC","emptyTrends":"इस नमूने में कोई हैशटैग नहीं।","firstUnknown":"इस नमूने से पहली पोस्ट तय नहीं की जा सकती।","conflict":"स्रोत के आँकड़े अलग हैं; अनिश्चित मान खाली हैं।","accessDenied":"आगंतुक स्रोत तक पहुँच अस्वीकृत (403)।","recentCreators":"हालिया VIA क्रिएटर"}} as const

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
    <section className="rounded-2xl border border-[#285f40]/70 bg-[#050806]/90 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
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
  const visitorRead = useAnalyticsSnapshot<VisitorAnalyticsResponse>("/api/via/analytics/visitors", 300000)
  const activityRead = useAnalyticsSnapshot<ActivityAnalyticsResponse>("/api/via/analytics/activity", 60000)
  const visitors = visitorRead.snapshot, activity = activityRead.snapshot
  const now = new Date(), utcDay = now.toISOString().slice(0, 10), utcMonth = utcDay.slice(0, 7)
  const sameDay = visitors?.periods?.today?.since?.slice(0, 10) === utcDay
  const sameMonth = visitors?.periods?.month?.since?.slice(0, 7) === utcMonth
  const visitorToday = sameDay ? measuredCount(visitors?.visitors?.today) : null
  const visitorMonth = sameMonth ? measuredCount(visitors?.visitors?.month) : null
  const visitorYear = measuredCount(visitors?.visitors?.year)
  const visitorCountries = sameDay ? (visitors?.countries ?? []).filter(row => typeof row.country === "string" && measuredCount(row.visitors) !== null) : []
  const activityPosts = measuredCount(activity?.activity?.posts), activityCreators = measuredCount(activity?.activity?.creators), activityNfts = measuredCount(activity?.activity?.nftPosts)
  const activeNow = visitors?.measuredAt && Date.now() - Date.parse(visitors.measuredAt) <= 300000 ? measuredCount(visitors.activeNow) : null
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

  const copy = COPY[language]
  const info = META[language]
  const stamp = (value?: string) => value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleString(({ Dutch:"nl-NL", English:"en-GB", French:"fr-FR", Spanish:"es-ES", Chinese:"zh-CN", Hindi:"hi-IN" })[language]) : "—"

  return (
    <aside className="space-y-3" aria-label="VIA live and activity panels" data-via-information-tower>
      <button type="button" className="text-xs text-[#9adbb2]" disabled={visitorRead.refreshing || activityRead.refreshing} onClick={() => { void visitorRead.refresh(true); void activityRead.refresh(true) }}>{visitorRead.refreshing || activityRead.refreshing ? info.loading : info.refresh}</button>
      <Panel title={copy.live}>
        <Metric label={info.activeWindow} value={activeNow} note={info.notMeasured} />
        <PendingMetric label={copy.desoAccounts} note={info.notMeasured} />
        <PendingMetric label={copy.guests} note={info.notMeasured} />
        {sameDay && visitors?.countriesAvailable ? (
          <div className="rounded-xl border border-zinc-800 bg-black/25">
            <button type="button" aria-expanded={countriesExpanded} aria-controls="via-countries-list"
              onClick={() => setCountriesExpanded((open) => !open)}
              className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9adbb2]">
              <span className="text-zinc-300">{copy.countries}</span>
              <span className="flex items-center gap-2 text-[#9adbb2]">
                {visitorCountries.length}{visitors?.countriesComplete === false ? "+" : ""} {copy.countryCount}
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
        ) : <PendingMetric label={copy.countries} note={info.notMeasured} />}
      </Panel>

      <Panel title={copy.visitors}>
        <p className="text-[10px] text-zinc-500">Vercel Web Analytics · {info.timezone}</p>
        {visitorRead.error ? <p role="status" className="text-xs text-amber-200">{visitorRead.error === "ANALYTICS_ACCESS_DENIED" ? info.accessDenied : info.unavailable}{visitors ? " · " + info.stale : ""}</p> : null}
        {visitors?.warnings?.length ? <p role="status" className="text-xs text-amber-200">{info.conflict}</p> : null}
        <Metric label={copy.today} value={visitorToday} note={info.notMeasured} />
        <Metric label={copy.month} value={visitorMonth} note={info.notMeasured} />
        <Metric label={copy.year} value={visitorYear} note={info.notMeasured} />
        <p className="text-[10px] text-zinc-500">{info.updated}: {stamp(visitors?.measuredAt)}</p>
      </Panel>

      <Panel title={copy.activity}>
        <p className="text-[10px] text-zinc-500">DeSo · {info.sample}: {activity?.sampledPosts ?? "—"} posts</p>
        {activityRead.error ? <p role="status" className="text-xs text-amber-200">{info.unavailable}{activity ? " · " + info.stale : ""}</p> : null}
        <Metric label={copy.posts} value={activityPosts} note={info.notMeasured} />
        <Metric label={copy.creators} value={activityCreators} note={info.notMeasured} />
        <div className="rounded-xl border border-zinc-800 px-3 py-2"><p className="text-zinc-300">{copy.trends}</p>{activity ? activity.trends?.length ? <ul className="mt-1 space-y-1">{activity.trends.map(row => <li key={row.tag} className="flex justify-between gap-2"><span>#{row.tag}</span><span>{row.count}</span></li>)}</ul> : <p className="mt-1 text-[10px] text-zinc-500">{info.emptyTrends}</p> : <span>—</span>}</div>
        <Metric label={copy.nftActivity} value={activityNfts} note={info.notMeasured} />
        <p className="text-[10px] text-zinc-500">{info.updated}: {stamp(activity?.measuredAt)}</p>
      </Panel>

      <Panel title={copy.community}>
        <PendingMetric label={copy.welcome} note={info.firstUnknown} />
        {activity?.recentCreators?.length ? <div className="text-xs"><p>{info.recentCreators}</p>{activity.recentCreators.map(row => <a key={row.publicKey} href={"/profile/" + encodeURIComponent(row.publicKey)} className="mt-1 block text-[#9adbb2]">{row.username ? "@" + row.username : row.publicKey.slice(0, 8) + "…"}</a>)}</div> : null}
      </Panel>
    </aside>
  )
}
