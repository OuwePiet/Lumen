import { NextResponse } from "next/server"
import { deduplicateStories, validateStory } from "../../../wereldspiegel/story-validation"
import { headlineCountryMentions } from "../../../wereldspiegel/headline-country-mentions"

// @OuwePiet 2026. Isolated global source pilot. Existing /news remains unchanged.
// Fixed HTTPS endpoints only, no user-provided URLs, no redirects, bounded response.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
const FEEDS = [
  { id: "globalvoices", name: "Global Voices", url: "https://globalvoices.org/feed/", kind: "rss" },
  { id: "care", name: "CARE International", url: "https://www.care.org/feed/", kind: "rss" },
  { id: "ips", name: "Inter Press Service", url: "https://www.ipsnews.net/feed/", kind: "rss" },
  { id: "zambiamonitor", name: "Zambia Monitor", url: "https://www.zambiamonitor.com/feed/", kind: "rss", editorialCountry: "ZM" },
  { id: "dabangasudan", name: "Radio Dabanga", url: "https://www.dabangasudan.org/en/feed", kind: "rss", editorialCountry: "SD" },
  { id: "namibian", name: "The Namibian", url: "https://www.namibian.com.na/feed/", kind: "rss", editorialCountry: "NA" },
  { id: "infoamazonia", name: "InfoAmazonia", url: "https://infoamazonia.org/feed/", kind: "rss", editorialRegion: "Zuid-Amerika" },
  { id: "newhumanitarian", name: "The New Humanitarian", url: "https://www.thenewhumanitarian.org/rss.xml", kind: "rss" },
  { id: "mongabay", name: "Mongabay", url: "https://news.mongabay.com/feed/", kind: "rss" },
  { id: "conversation", name: "The Conversation", url: "https://theconversation.com/global/articles.atom", kind: "atom" },
  { id: "sixthtone", name: "Sixth Tone", url: "https://api.sixthtone.com/cont/output/rssApi", kind: "rss" },
  { id: "restofworld", name: "Rest of World", url: "https://restofworld.org/feed/latest/", kind: "rss" },
  { id: "rfa", name: "Radio Free Asia", url: "https://www.rfa.org/arc/outboundfeeds/english/rss/", kind: "rss" },
  { id: "ukrainskapravda", name: "Ukrainska Pravda", url: "https://www.pravda.com.ua/eng/rss/", kind: "rss", editorialCountry: "UA" },
  { id: "moscowtimes", name: "The Moscow Times", url: "https://www.themoscowtimes.com/rss/news", kind: "rss" },
  { id: "ikon", name: "ikon.mn", url: "https://ikon.mn/rss", kind: "rss", editorialCountry: "MN" },
  { id: "kyivpost", name: "Kyiv Post", url: "https://www.kyivpost.com/feed", kind: "rss", editorialCountry: "UA" },
  { id: "thehindu", name: "The Hindu", url: "https://www.thehindu.com/news/national/feeder/default.rss", kind: "rss", editorialCountry: "IN" },
  { id: "indianexpress", name: "The Indian Express", url: "https://indianexpress.com/feed/", kind: "rss", editorialCountry: "IN" },
  { id: "eastmojo", name: "EastMojo", url: "https://eastmojo.com/feed/", kind: "rss", editorialCountry: "IN" },
  { id: "newslaundry", name: "Newslaundry", url: "https://www.newslaundry.com/stories.rss", kind: "rss", editorialCountry: "IN" },
  { id: "dailymaverick", name: "Daily Maverick", url: "https://www.dailymaverick.co.za/dmrss/", kind: "rss", editorialCountry: "ZA" },
  { id: "africanews", name: "Africanews", url: "https://www.africanews.com/feed/", kind: "rss", editorialRegion: "Afrika" },
  { id: "dialogueearth", name: "Dialogue Earth", url: "https://dialogue.earth/en/feed/", kind: "rss" },
  { id: "rnz", name: "RNZ", url: "https://www.rnz.co.nz/rss/world.xml", kind: "rss", editorialCountry: "NZ" },
  { id: "abcau", name: "ABC Australia", url: "https://www.abc.net.au/news/feed/51120/rss.xml", kind: "rss", editorialCountry: "AU" },
  { id: "batimes", name: "Buenos Aires Times", url: "https://www.batimes.com.ar/feed", kind: "rss", editorialCountry: "AR" },
  { id: "jamaicaobserver", name: "Jamaica Observer", url: "https://www.jamaicaobserver.com/feed/", kind: "rss", editorialCountry: "JM" },
  { id: "aljazeera", name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", kind: "rss" },
  { id: "arabnews", name: "Arab News", url: "https://www.arabnews.com/rss.xml", kind: "rss", editorialCountry: "SA" },
  { id: "timesofisrael", name: "The Times of Israel", url: "https://www.timesofisrael.com/feed/", kind: "rss", editorialCountry: "IL" },
  { id: "middleeastmonitor", name: "Middle East Monitor", url: "https://www.middleeastmonitor.com/feed/", kind: "rss", editorialRegion: "Midden-Oosten" },
  { id: "premiumtimes", name: "Premium Times Nigeria", url: "https://www.premiumtimesng.com/feed", kind: "rss", editorialCountry: "NG" },
  { id: "dawn", name: "Dawn Pakistan", url: "https://www.dawn.com/feeds/home", kind: "rss", editorialCountry: "PK" },
] as const
const MAX_BYTES = 750_000
function decode(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/\s+/g, " ").trim()
}
function field(s: string, tag: string): string {
  const escaped = tag.replace(/[^a-zA-Z0-9:]/g, "")
  const m = s.match(new RegExp("<" + escaped + "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/" + escaped + ">", "i"))
  return m ? decode(m[1]) : ""
}
async function load(feed: typeof FEEDS[number]) {
  try {
    const response = await fetch(feed.url, {
      redirect: "error", signal: AbortSignal.timeout(7000),
      headers: { Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml" },
      next: { revalidate: 900 },
    })
    if (!response.ok || !/xml|rss|atom|xhtml/i.test(response.headers.get("content-type") || "")) return { name: feed.name, status: "unavailable", stories: [] }
    if (Number(response.headers.get("content-length") || 0) > MAX_BYTES) return { name: feed.name, status: "too-large", stories: [] }
    if (!response.body) return { name: feed.name, status: "empty", stories: [] }
    const reader = response.body.getReader()
    const chunks: Uint8Array[] = []
    let size = 0
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        size += value.byteLength
        if (size > MAX_BYTES) { await reader.cancel(); return { name: feed.name, status: "too-large", stories: [] } }
        chunks.push(value)
      }
    } finally { reader.releaseLock() }
    const bytes = new Uint8Array(size)
    let at = 0
    for (const chunk of chunks) { bytes.set(chunk, at); at += chunk.length }
    const xml = new TextDecoder("utf-8", { fatal: true }).decode(bytes)
    const atom = feed.kind === "atom"
    const entries = [...xml.matchAll(atom ? /<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi : /<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].slice(0, 20)
    const stories = entries.map((match, i) => {
      const item = match[1]
      const title = field(item, "title").slice(0, 180)
      const summary = (field(item, atom ? "summary" : "description") || title).slice(0, 700)
      const sourceUrl = atom ? (item.match(/<link\b[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)/i)?.[1]
        || item.match(/<link\b[^>]*href=["']([^"']+)/i)?.[1] || "") : field(item, "link")
      const date = new Date(atom ? (field(item, "published") || field(item, "updated")) : (field(item, "pubDate") || field(item, "dc:date")))
      return validateStory({ id: `${feed.id}_${i}_${date.getTime()}`, title, summary,
        sourceName: feed.name, sourceUrl, publishedAt: Number.isFinite(date.getTime()) ? date.toISOString() : "", placeId: null })
    }).filter((story): story is NonNullable<typeof story> => story !== null)
    return { name: feed.name, status: stories.length ? "ready" : "no-verified-stories", stories }
  } catch { return { name: feed.name, status: "unavailable", stories: [] } }
}
export async function GET() {
  const batches = await Promise.all(FEEDS.map(load))
  // Reserve room for small and regional publishers before filling the remainder by recency.
  const all = deduplicateStories(batches.flatMap(batch => batch.stories))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  const selected = new Map<string, typeof all[number]>()
  // Fair round-robin: new sources must not be crowded out by earlier feed order.
  for (let round = 0; round < 4 && selected.size < 100; round++) {
    for (const batch of batches) {
      if (selected.size >= 100) break
      const story = batch.stories[round]
      if (story) selected.set(story.sourceUrl, story)
    }
  }
  for (const story of all) {
    if (selected.size >= 100) break
    selected.set(story.sourceUrl, story)
  }
  const stories = [...selected.values()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  const headlineMentions = stories.map(story => ({ id: story.id, countryCodes: headlineCountryMentions(story.title) })).filter(item => item.countryCodes.length > 0);
  const headlineMentionCoverage = { storiesWithExplicitCountryNames: headlineMentions.length, note: "Headline mention is not a verified story location", mentions: headlineMentions };
  const geography = { verifiedCountryStories: stories.filter(story => story.countryCode !== null).length, unlocatedStories: stories.filter(story => story.countryCode === null).length, verifiedPlaceStories: stories.filter(story => story.placeId !== null).length, policy: "publisher-location-is-not-story-location" };
  const selectedSourceNames = new Set(stories.map(story => story.sourceName));
  const sourceCoverage = { connected: FEEDS.length, withSelectedStories: FEEDS.filter(feed => selectedSourceNames.has(feed.name)).length, withoutSelectedStories: FEEDS.filter(feed => !selectedSourceNames.has(feed.name)).map(feed => feed.name), editorialOnlyNotStoryGeography: true };
  return NextResponse.json({ status: stories.length ? "ready" : "sources-unavailable", stories, geography, sourceCoverage, headlineMentionCoverage,
    sources: batches.map(({ name, status, stories: items }, index) => ({ name, status, count: items.length, selectedCount: stories.filter(story => story.sourceName === name).length, verifiedCountryCount: items.filter(story => story.countryCode !== null).length, editorialCountry: "editorialCountry" in FEEDS[index] ? FEEDS[index].editorialCountry : null, editorialRegion: "editorialRegion" in FEEDS[index] ? FEEDS[index].editorialRegion : null })) },
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=900, stale-while-revalidate=600" } })
}
