export function postVideoEmbed(value: string): string | null {
  try {
    const url = new URL(value)
    if (url.protocol !== "https:" || url.username || url.password) return null
    if (url.origin === "https://lvpr.tv" && url.pathname === "/") {
      const playbackId = url.searchParams.get("v") ?? ""
      return /^[A-Za-z0-9_-]{6,128}$/.test(playbackId) ? "https://lvpr.tv/?v=" + playbackId : null
    }
    const host = url.hostname.toLowerCase().replace(/^www\./, "")
    const parts = url.pathname.split("/").filter(Boolean)
    let id = ""
    if (host === "youtu.be") id = parts[0] ?? ""
    else if (["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)) {
      id = url.pathname === "/watch" ? url.searchParams.get("v") ?? "" : ["embed", "shorts", "live"].includes(parts[0] ?? "") ? parts[1] ?? "" : ""
    }
    if (/^[A-Za-z0-9_-]{6,20}$/.test(id)) return "https://www.youtube-nocookie.com/embed/" + id
    if (["videodelivery.net", "iframe.videodelivery.net", "watch.videodelivery.net"].includes(host) || /^customer-[a-z0-9]+\.cloudflarestream\.com$/.test(host)) {
      const stream = parts[0] ?? ""
      if (/^[a-f0-9]{32}$/i.test(stream)) return "https://iframe.videodelivery.net/" + stream
    }
    return null
  } catch { return null }
}
