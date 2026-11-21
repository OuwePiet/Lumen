"use client"

/**
 * VIA | @OuwePiet 2026 | eigen broncode en herkomstverklaring.
 * DeSo Identity 3.4.1: uitsluitend de bestaande centrale VIA-homepage-login gebruiken.
 * Deze afgeschermde technische proef vraagt GEEN wallet-machtiging, ondertekent
 * GEEN transactie en schrijft GEEN persoonlijke afspraken op de DeSo-blockchain.
 * Geen secrets, tokens, private keys, externe agenda-koppelingen of serveropslag.
 * Productievereisten: sessieautorisatie, veilige privéopslag, expliciete toestemming,
 * herkomstcontrole, bestedingslimieten en beveiligingstests vóór activering.
 * Deze tekst is een provenance marker, GEEN cryptografische codehandtekening.
 */import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { deletePrivateCalendar, exportEncryptedBackup, hasPrivateCalendar, importEncryptedBackup, loadPrivateCalendar, savePrivateCalendar } from "./private-storage"

type Repeat = "none" | "daily" | "weekly" | "monthly" | "yearly"
type Appointment = { id: number; title: string; date: string; time: string; repeat: Repeat; reminder: boolean }

/** VIA Mijn Agenda: isolated, session-only prototype. No blockchain, backend or external calendar writes. */
export default function MijnAgendaProef() {
  const [items, setItems] = useState<Appointment[]>([])
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [repeat, setRepeat] = useState<Repeat>("none")
  const [notice, setNotice] = useState("")
  const [reminder, setReminder] = useState(false)
  const [imported, setImported] = useState(false)
  const [passphrase, setPassphrase] = useState("")
  const [savedOnDevice, setSavedOnDevice] = useState(false)
  const [busy, setBusy] = useState(false)
  const [monthOffset, setMonthOffset] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [weekStartsMonday, setWeekStartsMonday] = useState(true)
  const monthView = useMemo(() => {
    const today = new Date()
    const first = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
    const start = new Date(first)
    start.setDate(1 - ((first.getDay() + (weekStartsMonday ? 6 : 0)) % 7))
    return { label: first.toLocaleDateString("nl-NL", {month:"long",year:"numeric"}), month: first.getMonth(), days: Array.from({length:42}, (_,i) => { const day = new Date(start); day.setDate(start.getDate()+i); return {key:[day.getFullYear(),String(day.getMonth()+1).padStart(2,"0"),String(day.getDate()).padStart(2,"0")].join("-"),number:day.getDate(),inMonth:day.getMonth()===first.getMonth()} }) }
  }, [monthOffset, weekStartsMonday])
  const eventsByDate = useMemo(() => {
    const result: Record<string, Appointment[]> = {}
    for (const item of items) {
      const base = new Date(item.date + "T12:00:00")
      if (Number.isNaN(base.getTime())) continue
      for (const day of monthView.days) {
        const target = new Date(day.key + "T12:00:00")
        const delta = Math.round((target.getTime()-base.getTime())/86400000)
        const months = (target.getFullYear()-base.getFullYear())*12+target.getMonth()-base.getMonth()
        const matches = delta >= 0 && (delta===0 || item.repeat==="daily" || item.repeat==="weekly" && delta%7===0 || item.repeat==="monthly" && months>=0 && target.getDate()===base.getDate() || item.repeat==="yearly" && target.getMonth()===base.getMonth() && target.getDate()===base.getDate())
        if (matches) (result[day.key] ||= []).push(item)
      }
    }
    return result
  }, [items,monthView])
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("viaSource") !== "world-calendar") return
    const eventTitle = (params.get("title") || "").trim().slice(0, 160)
    const eventDate = params.get("date") || ""
    if (!eventTitle || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate) || Number.isNaN(new Date(eventDate + "T12:00:00").getTime())) return
    setTitle(eventTitle)
    setDate(eventDate)
    setImported(true)
    setNotice("Gebeurtenis uit de Wereldkalender ingevuld. Controleer de gegevens en kies Afspraak toevoegen.")
    window.history.replaceState(null, "", window.location.pathname)
  }, [])
  useEffect(() => { setSavedOnDevice(hasPrivateCalendar()) }, [])
  const saveEncrypted = async () => {
    setBusy(true)
    try { await savePrivateCalendar(items, passphrase); setSavedOnDevice(true); setNotice("Versleutelde kopie op dit apparaat bewaard. Bewaar je wachtzin zelf.") }
    catch (error) { setNotice(error instanceof Error ? error.message : "Opslaan mislukt.") }
    finally { setBusy(false); setPassphrase("") }
  }
  const unlockEncrypted = async () => {
    setBusy(true)
    try { const loaded = await loadPrivateCalendar(passphrase); if (items.length && !window.confirm("Huidige sessieafspraken vervangen door de opgeslagen agenda?")) return; setItems(loaded); setNotice("Versleutelde agenda geopend. Wijzigingen moet je opnieuw opslaan.") }
    catch { setNotice("Ontgrendelen mislukt: controleer wachtzin of opgeslagen gegevens.") }
    finally { setBusy(false); setPassphrase("") }
  }
  const eraseEncrypted = () => {
    if (!window.confirm("De versleutelde kopie op dit apparaat definitief verwijderen?")) return
    deletePrivateCalendar(); setSavedOnDevice(false); setNotice("Opgeslagen kopie verwijderd. Huidige sessie blijft open.")
  }
  const downloadEncrypted = () => {
    try {
      const blob = new Blob([exportEncryptedBackup()], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = "via-mijn-agenda-versleuteld.json"; anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
      setNotice("Versleutelde back-up gedownload. De wachtzin blijft noodzakelijk.")
    } catch { setNotice("Geen versleutelde back-up beschikbaar.") }
  }
  const uploadEncrypted = async (file?: File) => {
    if (!file) return
    if (file.size > 3_000_000) { setNotice("Back-upbestand te groot."); return }
    if (savedOnDevice && !window.confirm("Bestaande versleutelde apparaatkopie vervangen?")) return
    try { importEncryptedBackup(await file.text()); setSavedOnDevice(true); setNotice("Versleutelde back-up ingelezen. Open deze met je wachtzin.") }
    catch { setNotice("Ongeldig back-upbestand of opslag niet beschikbaar.") }
  }
  const add = () => {
    if (!title.trim() || !date) { setNotice("Vul een onderwerp en datum in."); return }
    const normalized = title.trim().replace(/\s+/g," ").toLocaleLowerCase("nl-NL")
    if (items.some(item => item.date===date && item.time===time && item.title.trim().replace(/\s+/g," ").toLocaleLowerCase("nl-NL")===normalized)) {
      setNotice("Deze afspraak staat al op dezelfde datum en tijd in Mijn Agenda.")
      return
    }
    setItems(previous => [...previous, { id: Date.now() + Math.random(), title: title.trim().slice(0, 160), date, time, repeat, reminder }].sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time)))
    setTitle(""); setTime(""); setRepeat("none"); setReminder(false); setNotice("Afspraak toegevoegd aan deze tijdelijke sessie.")
  }
  const exportIcs = () => {
    const escape = (value: string) => value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;")
    const rows = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//VIA//Mijn Agenda Proef//NL", "CALSCALE:GREGORIAN"]
    for (const item of items) {
      const start = item.date.replace(/-/g, "") + (item.time ? "T" + item.time.replace(":", "") + "00" : "")
      const end = new Date(item.date + "T12:00:00")
      end.setDate(end.getDate() + 1)
      const nextDate = [end.getFullYear(), String(end.getMonth() + 1).padStart(2, "0"), String(end.getDate()).padStart(2, "0")].join("")
      const repeatRule = item.repeat === "none" ? [] : ["RRULE:FREQ=" + item.repeat.toUpperCase()]
      rows.push("BEGIN:VEVENT", "UID:via-proef-" + item.id + "@viadeso.online", "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""), item.time ? "DTSTART:" + start : "DTSTART;VALUE=DATE:" + start, ...(item.time ? ["DURATION:PT1H"] : ["DTEND;VALUE=DATE:" + nextDate]), ...repeatRule, "SUMMARY:" + escape(item.title), ...(item.reminder && item.time ? ["BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + escape(item.title), "TRIGGER:-PT15M", "END:VALARM"] : []), "END:VEVENT")
    }
    rows.push("END:VCALENDAR")
    const url = URL.createObjectURL(new Blob([rows.join("\r\n") + "\r\n"], { type: "text/calendar;charset=utf-8" }))
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "via-mijn-agenda-proef.ics"; anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const field = { background: "#102d48", color: "#fff", border: "1px solid #bda36d", borderRadius: 8, padding: 10, minWidth: 0 }
  return <main style={{ minHeight: "100vh", background: "#07182e", color: "#f4e5c2", padding: "24px max(16px, 5vw)" }}>
    <nav aria-label="Mijn Agenda snelnavigatie" style={{ position: "sticky", top: 0, zIndex: 30, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", padding: "8px 10px", background: "#07182e", borderBottom: "1px solid #bda36d" }}><Link href="/wereldkalender/proef19" style={{ color: "inherit", fontWeight: 700 }}>← Wereldkalender</Link><Link href="/" style={{ color: "inherit" }}>VIA Home</Link><Link href="/help" style={{ color: "inherit" }}>Handboek VIA</Link><Link href="/music" style={{ color: "inherit" }}>VIA Play</Link></nav>
    <h1>Mijn Agenda — technische proef</h1>
    <p style={{ maxWidth: 800 }}>Afspraken blijven in deze sessie totdat je ze expliciet versleuteld op dit apparaat bewaart. Geen accountkoppeling, geen synchronisatie, geen serveropslag en geen publicatie op DeSo. Dit is nog geen geteste productiebeveiliging; gebruik geen vertrouwelijke afspraken.</p>
    <section aria-label="Compacte agenda" style={{marginTop:18, border:"1px solid #bda36d",borderRadius:12,padding:12}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button style={field} aria-label="Vorige maand" onClick={()=>setMonthOffset(n=>n-1)}>‹</button>
          <strong style={{minWidth:150,textAlign:"center",textTransform:"capitalize"}}>{monthView.label}</strong>
          <button style={field} aria-label="Volgende maand" onClick={()=>setMonthOffset(n=>n+1)}>›</button>
          <button style={field} onClick={()=>setMonthOffset(0)}>Vandaag</button>
        </div>
        <button style={field} aria-expanded={showSettings} onClick={()=>setShowSettings(v=>!v)}>Instellingen {showSettings?"−":"+"}</button>
      </div>
      {showSettings && <div style={{padding:"12px 0"}}><label><input type="checkbox" checked={weekStartsMonday} onChange={e=>setWeekStartsMonday(e.target.checked)}/> Week begint op maandag</label><p style={{fontSize:12}}>Persoonlijke afspraken blijven privé. Bewaren en back-ups staan onder de agenda.</p></div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",gap:3,marginTop:12}}>
        {(weekStartsMonday?["ma","di","wo","do","vr","za","zo"]:["zo","ma","di","wo","do","vr","za"]).map(day=><div key={day} style={{textAlign:"center",fontSize:12,fontWeight:700,padding:5}}>{day}</div>)}
        {monthView.days.map(day=><button key={day.key} type="button" onClick={()=>setDate(day.key)} aria-label={day.key+"; "+(eventsByDate[day.key]?.length||0)+" afspraken"} style={{background:date===day.key?"#365c7c":day.inMonth?"#102d48":"#091f33",color:day.inMonth?"#f4e5c2":"#98a7b4",border:date===day.key?"2px solid #f4e5c2":"1px solid #31506a",borderRadius:5,minHeight:66,padding:4,textAlign:"left",overflow:"hidden",cursor:"pointer"}}>
          <span style={{fontSize:12,fontWeight:700}}>{day.number}</span>
          {(eventsByDate[day.key]||[]).slice(0,2).map(item=><div key={item.id} style={{fontSize:10,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={item.title}>{item.time?item.time+" ":""}{item.title}</div>)}
          {(eventsByDate[day.key]||[]).length>2&&<span style={{fontSize:10}}>+{eventsByDate[day.key].length-2}</span>}
        </button>)}
      </div>
      <p style={{fontSize:12}}>Kies een dag om de datum van een nieuwe afspraak in te vullen. Terugkerende afspraken worden in het overzicht getoond.</p>
    </section>    <section aria-label="Afspraak toevoegen" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end", marginTop: 24 }}>
      <label style={{ display: "grid", gap: 5 }}>Onderwerp<input style={field} value={title} maxLength={160} onChange={event => setTitle(event.target.value)} /></label>
      <label style={{ display: "grid", gap: 5 }}>Datum<input style={field} type="date" value={date} onChange={event => setDate(event.target.value)} /></label>
      <label style={{ display: "grid", gap: 5 }}>Tijd (optioneel)<input style={field} type="time" value={time} onChange={event => setTime(event.target.value)} /></label>
      <label style={{ display: "grid", gap: 5 }}>Herhaling<select style={field} value={repeat} onChange={event => setRepeat(event.target.value as Repeat)}><option value="none">Eenmalig</option><option value="daily">Dagelijks</option><option value="weekly">Wekelijks</option><option value="monthly">Maandelijks</option><option value="yearly">Jaarlijks</option></select></label>      <label style={{ display: "flex", gap: 6, alignItems: "center" }}><input type="checkbox" checked={reminder} disabled={!time} onChange={event => setReminder(event.target.checked)} />Herinnering 15 minuten vooraf (bij tijd)</label>
      <button style={field} onClick={add}>Afspraak toevoegen</button>
    </section>
    <p role="status">{notice}</p>{imported && <p>Dit is een voorstel: er is nog niets opgeslagen of gesynchroniseerd.</p>}
    <section aria-label="Versleutelde apparaatopslag" style={{ border: "1px solid #bda36d", borderRadius: 12, padding: 14, margin: "18px 0" }}>
      <h2>Privé bewaren op dit apparaat — proef</h2>
      <p>Optioneel: AES-GCM-versleuteling met een eigen wachtzin (minimaal 12 tekens). Zonder wachtzin zijn de afspraken niet terug te halen. De kopie blijft alleen in deze browser; verwijderen van browsergegevens kan de agenda wissen. Geen automatische synchronisatie. Een versleutelde back-up kan handmatig naar een ander apparaat worden overgebracht; de wachtzin blijft nodig.</p>
      <label style={{ display: "grid", gap: 5, maxWidth: 360 }}>Wachtzin<input style={field} type="password" autoComplete="off" value={passphrase} onChange={event => setPassphrase(event.target.value)} /></label>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
        <button style={field} disabled={busy || !items.length || passphrase.length < 12} onClick={saveEncrypted}>Versleuteld opslaan</button>
        <button style={field} disabled={busy || !savedOnDevice || !passphrase} onClick={unlockEncrypted}>Opgeslagen agenda openen</button>
        <button style={field} disabled={busy || !savedOnDevice} onClick={eraseEncrypted}>Opgeslagen kopie verwijderen</button>
        <button style={field} disabled={!savedOnDevice} onClick={downloadEncrypted}>Download versleutelde back-up</button>
        <label style={{ display: "grid", gap: 5 }}>Back-upbestand openen<input type="file" accept=".json,application/json" onChange={event => { void uploadEncrypted(event.target.files?.[0]); event.target.value = "" }} /></label>
      </div>
      <p>{savedOnDevice ? "Er is een versleutelde kopie aanwezig op dit apparaat." : "Er is nog geen versleutelde kopie op dit apparaat."}</p>
    </section>
    <section aria-label="Mijn afspraken"><h2>Afspraken in deze sessie ({items.length})</h2>
      {items.length === 0 ? <p>Nog geen afspraken toegevoegd.</p> : <ul>{items.map(item => <li key={item.id} style={{ padding: 8 }}>{item.date} {item.time} — {item.title} {item.repeat !== "none" ? "(" + ({daily:"dagelijks",weekly:"wekelijks",monthly:"maandelijks",yearly:"jaarlijks"} as Record<string,string>)[item.repeat] + ")" : ""} <button style={{ ...field, marginLeft: 12 }} onClick={() => setItems(previous => previous.filter(x => x.id !== item.id))}>Verwijder</button></li>)}</ul>}
      <button style={field} disabled={items.length === 0} onClick={exportIcs}>Exporteer naar agenda (.ics)</button>
    </section>
    <p style={{ marginTop: 32, fontSize: 13 }}>Vervolg: VIA Identity 3.4.1-toegang, veilige privéopslag, expliciete agenda-toestemming, synchronisatie en tests op alle apparaten. Dit is nog niet de definitieve persoonlijke agenda.</p>
  </main>
}