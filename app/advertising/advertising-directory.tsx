"use client"

import { useEffect, useState } from "react"

type DirectoryCard = {
  id: string
  title: string
  sponsorName: string
  imageUrl: string | null
  destinationUrl: string
  startAt: string
  endAt: string
  pageOne: boolean
}

type DirectoryResponse = {
  page: number
  pageSize: number
  totalPages: number
  totalCards: number
  pageOneCapacity: number
  pageOneReserved: number
  pageOneFull: boolean
  cards: DirectoryCard[]
}

export default function AdvertisingDirectory() {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<DirectoryResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    void fetch(`/api/via/sponsor-directory?page=${page}`, {
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => response.ok ? await response.json() as DirectoryResponse : null)
      .then((next) => {
        if (!next) return
        setData(next)
        if (next.page !== page) setPage(next.page)
      })
      .catch(() => undefined)
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [page])

  if (loading && !data) {
    return <p style={{ marginTop: 22, color: "#7f8c84" }}>Sponsoroverzicht laden…</p>
  }

  const cards = data?.cards ?? []
  const totalPages = data?.totalPages ?? 1

  return (
    <section style={{ marginTop: 26 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22 }}>Sponsoroverzicht</h2>
          <p style={{ margin: "6px 0 0", color: "#8d9b92", fontSize: 13 }}>
            Pagina {data?.page ?? page} van {totalPages} · {data?.totalCards ?? 0} actieve sponsor{(data?.totalCards ?? 0) === 1 ? "" : "s"}
          </p>
        </div>
        <span style={{ border: "1px solid rgba(143,212,169,.26)", borderRadius: 999, padding: "7px 11px", color: "#9adbb2", fontSize: 11 }}>
          Pagina 1: {data?.pageOneReserved ?? 0}/{data?.pageOneCapacity ?? 12} voorkeurplaatsen
        </span>
      </div>

      {cards.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginTop: 16 }}>
          {cards.map((card) => (
            <a key={card.id} href={card.destinationUrl} target="_blank" rel="sponsored noreferrer" style={{ minHeight: 180, position: "relative", overflow: "hidden", border: "1px solid rgba(143,212,169,.2)", borderRadius: 16, background: "rgba(7,13,9,.82)", color: "inherit", textDecoration: "none" }}>
              {card.imageUrl ? <img src={card.imageUrl} alt={card.title} loading="lazy" referrerPolicy="no-referrer" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} /> : null}
              <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: card.imageUrl ? "linear-gradient(to top, rgba(0,0,0,.9), rgba(0,0,0,.16) 62%)" : "radial-gradient(circle at 75% 20%, rgba(143,212,169,.11), transparent 45%)" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 15 }}>
                <span style={{ color: "#8fd4a9", fontSize: 9, fontWeight: 800, letterSpacing: ".13em", textTransform: "uppercase" }}>Sponsored{card.pageOne ? " · Pagina 1" : ""}</span>
                <strong style={{ marginTop: 5, fontSize: 16 }}>{card.title}</strong>
                <span style={{ marginTop: 3, color: "#b0bbb4", fontSize: 11 }}>{card.sponsorName}</span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 16, border: "1px solid rgba(143,212,169,.16)", borderRadius: 14, padding: 18, color: "#89968e" }}>
          Op deze pagina staan op dit moment geen actieve sponsorkaarten.
        </div>
      )}

      {totalPages > 1 ? (
        <nav aria-label="Sponsor pages" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
            <button key={number} type="button" onClick={() => setPage(number)} aria-current={page === number ? "page" : undefined} style={{ minWidth: 38, minHeight: 38, border: page === number ? "1px solid rgba(143,212,169,.6)" : "1px solid rgba(113,130,120,.38)", borderRadius: 999, background: page === number ? "rgba(18,53,34,.58)" : "rgba(3,12,7,.72)", color: page === number ? "#b9ffd4" : "#9aa69f", cursor: "pointer" }}>
              {number}
            </button>
          ))}
        </nav>
      ) : null}

      {data?.pageOneFull ? (
        <p style={{ marginTop: 16, color: "#c9ab73", fontSize: 12, lineHeight: 1.5 }}>
          Pagina 1 is momenteel vol. Nieuwe sponsorplaatsingen lopen automatisch door naar de volgende beschikbare pagina.
        </p>
      ) : null}
    </section>
  )
}
