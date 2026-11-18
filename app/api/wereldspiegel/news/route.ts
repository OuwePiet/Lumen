import { NextResponse } from "next/server";
import { validateStory, deduplicateStories } from "../../../wereldspiegel/story-validation";

export const runtime = "nodejs";
const FEEDS = [
  { name: "United Nations News", url: "https://news.un.org/feed/subscribe/en/news/all/rss.xml", place: "Wereldnieuws" },
  { name: "NASA", url: "https://www.nasa.gov/feed/", place: "Ruimtevaart" },
] as const;

function decode(s: string) {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/\s+/g, " ").trim();
}
function field(item: string, tag: string) {
  const m = item.match(new RegExp("<" + tag + "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/" + tag + ">", "i"));
  return m ? decode(m[1]) : "";
}
async function load(feed: typeof FEEDS[number]) {
  try {
    const response = await fetch(feed.url, { redirect: "error", signal: AbortSignal.timeout(9000), next: { revalidate: 900 }, headers: { Accept: "application/rss+xml, application/xml" } });
    if (!response.ok || !/xml|rss/.test(response.headers.get("content-type") || "")) return [];
    if (Number(response.headers.get("content-length") || 0) > 350000) return [];
    const body = await response.text();
    if (body.length > 350000 || !body.includes("<rss")) return [];
    const items = [...body.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].slice(0, 25);
    return items.map((match, i) => {
      const xml = match[1];
      const title = field(xml, "title").slice(0, 180);
      const summary = field(xml, "description").slice(0, 680) || title;
      const sourceUrl = field(xml, "link");
      const published = new Date(field(xml, "pubDate"));
      return validateStory({ id: feed.name.replace(/\W/g, "") + "_" + i + "_" + published.getTime(), title, summary, sourceName: feed.name, sourceUrl, publishedAt: Number.isFinite(published.getTime()) ? published.toISOString() : "", placeId: null });
    }).filter((story): story is NonNullable<typeof story> => story !== null);
  } catch { return []; }
}
export async function GET() {
  const batches = await Promise.all(FEEDS.map(load));
  const stories = deduplicateStories(batches.flat()).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 40);
  return NextResponse.json({ stories, sources: FEEDS.map(f => f.name), live: stories.length > 0 }, { headers: { "Cache-Control": "public, max-age=120, stale-while-revalidate=600" } });
}