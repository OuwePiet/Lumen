"use client"

import { useEffect, useState } from "react"
import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "./via-local-settings"
import SponsorPlatform from "./sponsor-platform"

type CityItem = {
  city: string
  country: string
  imageUrl: string | null
  descriptionUrl: string | null
  title: string | null
  artist: string | null
  license: string | null
  seasonal: boolean
}

type CityResponse = {
  month?: string
  source?: string
  items?: CityItem[]
}

type SponsorCopy = {
  featured: string
  spotlight: string
  commercial: string
  sponsor: string
  bestPerformer: string
  recognition: string
  specialBadge: string
  requestTitle: string
  requestBody: string
  close: string
  name: string
  contact: string
  title: string
  url: string
  material: string
  chooseFile: string
  noFile: string
  display: string
  static: string
  slow: string
  payment: string
  save: string
  saved: string
  paymentInfo: string
  christmasCity: string
  worldCity: string
  source: string
  contributionLine: string
}

const sponsorCopy: Record<ViaLanguage, SponsorCopy> = {
  Dutch: {
    featured: "Uitgelicht in VIA",
    spotlight: "Gesponsorde spotlight",
    commercial: "Commerciële plaatsing · betaald na goedkeuring",
    sponsor: "Sponsor VIA",
    bestPerformer: "Beste performer",
    recognition: "VIA creator-erkenning",
    specialBadge: "Speciale badge",
    requestTitle: "Aanvraag voor sponsorplaatsing",
    requestBody: "Vul de plaatsing in, kies stilstaand of zeer langzaam bewegend materiaal en selecteer het bestand. Betaling volgt pas nadat VIA de uitvoering en prijs heeft bevestigd.",
    close: "Sponsorvenster sluiten",
    name: "Naam / organisatie",
    contact: "E-mail of contact",
    title: "Titel van de sponsorplaatsing",
    url: "Bestemmingslink (https://…)",
    material: "Materiaal",
    chooseFile: "Bestand kiezen",
    noFile: "Geen bestand geselecteerd",
    display: "Weergave",
    static: "Stilstaand",
    slow: "Zeer langzaam bewegen",
    payment: "Betaling: na goedkeuring van uitvoering en prijs. De checkout wordt pas geactiveerd zodra VIA een echte betaalprovider heeft gekoppeld.",
    save: "Concept opslaan",
    saved: "Concept opgeslagen",
    paymentInfo: "Betaalinformatie",
    christmasCity: "Kerststad",
    worldCity: "Wereldstad",
    source: "Bekijk afbeeldingsbron voor",
    contributionLine: "Elke bijdrage telt — ook de kleinste.",
  },
  English: {
    featured: "Featured in VIA",
    spotlight: "Sponsored spotlight",
    commercial: "Commercial placement · paid after approval",
    sponsor: "Sponsor VIA",
    bestPerformer: "Best performer",
    recognition: "VIA creator recognition",
    specialBadge: "Special badge",
    requestTitle: "Sponsor placement request",
    requestBody: "Enter the placement details, choose static or very slowly moving material, and select the file. Payment follows only after VIA confirms the execution and price.",
    close: "Close sponsor window",
    name: "Name / organisation",
    contact: "Email or contact",
    title: "Sponsor placement title",
    url: "Destination link (https://…)",
    material: "Material",
    chooseFile: "Choose file",
    noFile: "No file selected",
    display: "Display",
    static: "Static",
    slow: "Very slow movement",
    payment: "Payment: after approval of execution and price. Checkout will only be activated once VIA has connected a real payment provider.",
    save: "Save draft",
    saved: "Draft saved",
    paymentInfo: "Payment information",
    christmasCity: "Christmas City",
    worldCity: "World City",
    source: "View image source for",
    contributionLine: "Every contribution counts — even the smallest.",
  },
  French: {
    featured: "À la une sur VIA",
    spotlight: "Mise en avant sponsorisée",
    commercial: "Placement commercial · paiement après approbation",
    sponsor: "Sponsoriser VIA",
    bestPerformer: "Meilleure performance",
    recognition: "Reconnaissance créateur VIA",
    specialBadge: "Badge spécial",
    requestTitle: "Demande de placement sponsorisé",
    requestBody: "Renseignez le placement, choisissez un contenu fixe ou animé très lentement et sélectionnez le fichier. Le paiement n’intervient qu’après confirmation de l’exécution et du prix par VIA.",
    close: "Fermer la fenêtre sponsor",
    name: "Nom / organisation",
    contact: "E-mail ou contact",
    title: "Titre du placement sponsorisé",
    url: "Lien de destination (https://…)",
    material: "Média",
    chooseFile: "Choisir un fichier",
    noFile: "Aucun fichier sélectionné",
    display: "Affichage",
    static: "Fixe",
    slow: "Mouvement très lent",
    payment: "Paiement : après approbation de l’exécution et du prix. Le paiement en ligne ne sera activé qu’une fois qu’un véritable prestataire de paiement sera connecté à VIA.",
    save: "Enregistrer le brouillon",
    saved: "Brouillon enregistré",
    paymentInfo: "Informations de paiement",
    christmasCity: "Ville de Noël",
    worldCity: "Ville du monde",
    source: "Voir la source de l’image pour",
    contributionLine: "Chaque contribution compte — même la plus petite.",
  },
  Spanish: {
    featured: "Destacado en VIA",
    spotlight: "Espacio patrocinado",
    commercial: "Colocación comercial · pago tras aprobación",
    sponsor: "Patrocinar VIA",
    bestPerformer: "Mejor rendimiento",
    recognition: "Reconocimiento a creadores VIA",
    specialBadge: "Insignia especial",
    requestTitle: "Solicitud de espacio patrocinado",
    requestBody: "Completa los datos, elige material estático o con movimiento muy lento y selecciona el archivo. El pago se realiza únicamente después de que VIA confirme la ejecución y el precio.",
    close: "Cerrar ventana de patrocinio",
    name: "Nombre / organización",
    contact: "Correo electrónico o contacto",
    title: "Título del espacio patrocinado",
    url: "Enlace de destino (https://…)",
    material: "Material",
    chooseFile: "Elegir archivo",
    noFile: "Ningún archivo seleccionado",
    display: "Visualización",
    static: "Estático",
    slow: "Movimiento muy lento",
    payment: "Pago: después de aprobar la ejecución y el precio. El pago en línea solo se activará cuando VIA tenga conectado un proveedor de pagos real.",
    save: "Guardar borrador",
    saved: "Borrador guardado",
    paymentInfo: "Información de pago",
    christmasCity: "Ciudad navideña",
    worldCity: "Ciudad del mundo",
    source: "Ver fuente de imagen de",
    contributionLine: "Cada contribución cuenta, incluso la más pequeña.",
  },
  Chinese: {
    featured: "VIA 精选",
    spotlight: "赞助展示位",
    commercial: "商业展示 · 审核后付款",
    sponsor: "赞助 VIA",
    bestPerformer: "最佳表现",
    recognition: "VIA 创作者认可",
    specialBadge: "特别徽章",
    requestTitle: "赞助展示申请",
    requestBody: "填写展示信息，选择静态或非常缓慢移动的素材并选择文件。VIA 确认制作方式和价格后才进行付款。",
    close: "关闭赞助窗口",
    name: "姓名 / 机构",
    contact: "电子邮箱或联系方式",
    title: "赞助展示标题",
    url: "目标链接 (https://…)",
    material: "素材",
    chooseFile: "选择文件",
    noFile: "未选择文件",
    display: "展示方式",
    static: "静态",
    slow: "非常缓慢移动",
    payment: "付款：在制作方式和价格审核通过后进行。只有 VIA 接入真实支付服务商后，在线结账才会启用。",
    save: "保存草稿",
    saved: "草稿已保存",
    paymentInfo: "付款信息",
    christmasCity: "圣诞城市",
    worldCity: "世界城市",
    source: "查看图片来源：",
    contributionLine: "每一份支持都很重要，即使是最小的一份。",
  },
}

const fallbackCities: CityItem[] = [
  { city: "Tokyo", country: "Japan", imageUrl: null, descriptionUrl: null, title: null, artist: null, license: null, seasonal: false },
  { city: "Lagos", country: "Nigeria", imageUrl: null, descriptionUrl: null, title: null, artist: null, license: null, seasonal: false },
  { city: "São Paulo", country: "Brazil", imageUrl: null, descriptionUrl: null, title: null, artist: null, license: null, seasonal: false },
  { city: "Sydney", country: "Australia", imageUrl: null, descriptionUrl: null, title: null, artist: null, license: null, seasonal: false },
]

export default function ViaFeatured() {
  const [items, setItems] = useState<CityItem[]>(fallbackCities)
  const [sponsorOpen, setSponsorOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [materialName, setMaterialName] = useState("")
  const [language, setLanguage] = useState<ViaLanguage>("English")

  useEffect(() => {
    const syncLanguage = () => setLanguage(readViaLocalSettings().interfaceLanguage)
    syncLanguage()
    window.addEventListener(VIA_SETTINGS_EVENT, syncLanguage)
    return () => window.removeEventListener(VIA_SETTINGS_EVENT, syncLanguage)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void fetch("/api/via/featured-cities", {
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => response.ok ? (await response.json()) as CityResponse : null)
      .then((data) => {
        if (Array.isArray(data?.items) && data.items.length === 4) setItems(data.items)
      })
      .catch(() => undefined)
    return () => controller.abort()
  }, [])

  const t = sponsorCopy[language]

  function saveSponsorDraft(form: HTMLFormElement) {
    const data = new FormData(form)
    const payload = {
      name: String(data.get("name") ?? ""),
      contact: String(data.get("contact") ?? ""),
      title: String(data.get("title") ?? ""),
      url: String(data.get("url") ?? ""),
      motion: String(data.get("motion") ?? "static"),
      materialName: (data.get("material") as File | null)?.name ?? "",
      savedAt: new Date().toISOString(),
    }
    window.localStorage.setItem("via:sponsor:draft:v1", JSON.stringify(payload))
    setSaved(true)
  }

  return (
    <>
      <section
        aria-labelledby="via-featured-title"
        className="via-home-featured"
        style={{
          position: "absolute",
          zIndex: 3,
          top: "24px",
          right: "16px",
          bottom: "92px",
          width: "306px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          overflowY: "auto",
        }}
      >
        <h2 id="via-featured-title" style={{ margin: "0 0 2px", color: "#dce5df", fontSize: "14px", fontWeight: 700, letterSpacing: ".01em" }}>
          {t.featured}
        </h2>

        {items.slice(0, 2).map((item) => <CityCard key={`${item.city}-${item.country}`} item={item} copy={t} />)}

        <div style={{ minHeight: "150px", display: "grid", gridTemplateRows: "1.2fr 1fr", overflow: "hidden", border: "1px solid rgba(143,212,169,.17)", borderRadius: "15px", background: "rgba(3,10,6,.72)", backdropFilter: "blur(8px)" }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "4px", padding: "13px 15px", borderBottom: "1px solid rgba(143,212,169,.12)" }}>
            <span style={eyebrow}>{t.sponsor}</span>
            <strong style={middleTitle}>{t.spotlight}</strong>
            <span style={middleSub}>{t.commercial}</span>
            <button type="button" onClick={() => { setSaved(false); setMaterialName(""); setSponsorOpen(true) }} style={sponsorButton}>{t.spotlight}</button>
            <div style={{ marginTop: "7px", display: "grid", gap: "5px" }}>
              <SponsorPlatform compact />
              <span style={{ color: "#9adbb2", fontSize: "9px", fontWeight: 700, lineHeight: 1.35 }}>◆ {t.contributionLine}</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "13px 15px" }}>
            <span style={eyebrow}>{t.bestPerformer}</span>
            <strong style={middleTitle}>{t.recognition}</strong>
            <span style={middleSub}>{t.specialBadge}</span>
          </div>
        </div>

        {items.slice(2).map((item) => <CityCard key={`${item.city}-${item.country}`} item={item} copy={t} />)}
      </section>

      {sponsorOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.sponsor}
          style={{ position: "fixed", inset: 0, zIndex: 120, display: "grid", placeItems: "center", padding: "20px", background: "rgba(0,0,0,.74)", backdropFilter: "blur(8px)" }}
          onMouseDown={(event) => { if (event.currentTarget === event.target) setSponsorOpen(false) }}
        >
          <form
            onSubmit={(event) => { event.preventDefault(); saveSponsorDraft(event.currentTarget) }}
            style={{ width: "min(560px, 100%)", border: "1px solid rgba(143,212,169,.28)", borderRadius: "18px", padding: "22px", background: "#06100b", boxShadow: "0 24px 80px rgba(0,0,0,.55)" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
              <div>
                <span style={eyebrow}>{t.sponsor}</span>
                <h3 style={{ margin: "5px 0 0", color: "#edf4ef", fontSize: "22px" }}>{t.requestTitle}</h3>
                <p style={{ margin: "7px 0 0", color: "#92a097", fontSize: "12px", lineHeight: 1.55 }}>{t.requestBody}</p>
              </div>
              <button type="button" onClick={() => setSponsorOpen(false)} aria-label={t.close} style={{ border: 0, background: "transparent", color: "#9eaaa2", fontSize: "22px", cursor: "pointer" }}>×</button>
            </div>

            <div style={{ display: "grid", gap: "10px", marginTop: "18px" }}>
              <input name="name" required placeholder={t.name} style={fieldStyle} />
              <input name="contact" required placeholder={t.contact} style={fieldStyle} />
              <input name="title" required placeholder={t.title} style={fieldStyle} />
              <input name="url" type="url" placeholder={t.url} style={fieldStyle} />
              <label style={labelStyle}>
                {t.material}
                <span style={{ marginTop: "7px", minHeight: "42px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid rgba(143,212,169,.18)", borderRadius: "11px", padding: "8px 10px", background: "rgba(0,0,0,.24)" }}>
                  <span style={{ border: "1px solid rgba(143,212,169,.28)", borderRadius: "999px", padding: "6px 10px", color: "#b9ffd4", fontSize: "10px", cursor: "pointer", whiteSpace: "nowrap" }}>{t.chooseFile}</span>
                  <span style={{ color: "#87958d", fontSize: "10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{materialName || t.noFile}</span>
                </span>
                <input name="material" type="file" accept="image/*,video/*" onChange={(event) => setMaterialName(event.target.files?.[0]?.name ?? "")} style={{ position: "absolute", width: "1px", height: "1px", opacity: 0, pointerEvents: "none" }} />
              </label>
              <label style={labelStyle}>
                {t.display}
                <select name="motion" defaultValue="static" style={{ ...fieldStyle, width: "100%", marginTop: "7px" }}>
                  <option value="static">{t.static}</option>
                  <option value="slow">{t.slow}</option>
                </select>
              </label>
            </div>

            <div style={{ marginTop: "16px", padding: "11px 12px", border: "1px solid rgba(143,212,169,.16)", borderRadius: "12px", color: "#92a097", fontSize: "11px", lineHeight: 1.5 }}>
              {t.payment}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "9px", marginTop: "16px" }}>
              <button type="submit" style={{ ...sponsorButton, minHeight: "40px", paddingInline: "18px" }}>{saved ? t.saved : t.save}</button>
              <a href="/payment-info" style={{ ...sponsorButton, minHeight: "40px", paddingInline: "18px", textDecoration: "none", background: "rgba(3,12,7,.72)" }}>{t.paymentInfo}</a>
            </div>
          </form>
        </div>
      ) : null}
      <style>{`
        @media (max-width: 720px) {
          .via-home-featured {
            position: relative !important;
            top: auto !important;
            right: auto !important;
            bottom: auto !important;
            width: auto !important;
            margin: 10px !important;
            overflow: visible !important;
          }
        }
      `}</style>
    </>
  )
}

const eyebrow = {
  color: "#8fd4a9",
  fontSize: "8px",
  fontWeight: 800,
  letterSpacing: ".14em",
  textTransform: "uppercase" as const,
}

const middleTitle = { marginTop: "2px", color: "#edf3ef", fontSize: "12px" }
const middleSub = { marginTop: "1px", color: "#8f9c94", fontSize: "9px" }
const sponsorButton = { marginTop: "6px", alignSelf: "flex-start", minHeight: "30px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(143,212,169,.36)", borderRadius: "999px", padding: "6px 11px", background: "rgba(18,53,34,.58)", color: "#aef0c5", fontSize: "9px", fontWeight: 750, cursor: "pointer" } as const
const fieldStyle = { minHeight: "42px", border: "1px solid rgba(143,212,169,.18)", borderRadius: "11px", padding: "9px 11px", background: "rgba(0,0,0,.24)", color: "#e2ebe5", outline: "none" } as const
const labelStyle = { position: "relative", color: "#a7b4ac", fontSize: "11px" } as const

function CityCard({ item, copy }: { item: CityItem; copy: SponsorCopy }) {
  const content = (
    <article style={{ position: "relative", minHeight: "124px", overflow: "hidden", border: "1px solid rgba(143,212,169,.14)", borderRadius: "15px", background: "linear-gradient(145deg, rgba(5,14,9,.78), rgba(2,5,4,.9))" }}>
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={`${item.city}, ${item.country}`} loading="lazy" referrerPolicy="no-referrer" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : null}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: item.imageUrl ? "linear-gradient(to top, rgba(0,0,0,.82), rgba(0,0,0,.03) 64%)" : "radial-gradient(circle at 70% 25%, rgba(143,212,169,.12), transparent 44%)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "12px 13px" }}>
        <span style={eyebrow}>{item.seasonal ? copy.christmasCity : copy.worldCity}</span>
        <strong style={{ marginTop: "3px", color: "#f0f4f1", fontSize: "14px" }}>{item.city}</strong>
        <span style={{ marginTop: "1px", color: "#b7c1bb", fontSize: "9px" }}>{item.country}</span>
      </div>
    </article>
  )

  if (!item.descriptionUrl) return content

  return (
    <a href={item.descriptionUrl} target="_blank" rel="noreferrer" aria-label={`${copy.source} ${item.city}`} style={{ color: "inherit", textDecoration: "none" }}>
      {content}
    </a>
  )
}
