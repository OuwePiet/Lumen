/** © 2026 @OuwePiet — VIA. Device-local encrypted calendar prototype; not a server sync service. */
export type PrivateAppointment = { id: number; title: string; date: string; time: string; repeat: "none" | "daily" | "weekly" | "monthly" | "yearly"; reminder: boolean; place?: string; geoId?: string; countryCode?: string }
const KEY = "via:calendar:private-proef:v1"
const enc = new TextEncoder()
const dec = new TextDecoder()
const toB64 = (bytes: Uint8Array) => btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(""))
const fromB64 = (value: string) => Uint8Array.from(atob(value), char => char.charCodeAt(0))
async function derive(passphrase: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"])
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt as BufferSource, iterations: 250_000, hash: "SHA-256" }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"])
}
export async function savePrivateCalendar(items: PrivateAppointment[], passphrase: string) {
  if (passphrase.length < 12) throw new Error("Gebruik een wachtzin van minimaal 12 tekens.")
  if (items.length > 2000) throw new Error("Te veel afspraken voor deze proef.")
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await derive(passphrase, salt)
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(items)))
  try { localStorage.setItem(KEY, JSON.stringify({ version: 1, salt: toB64(salt), iv: toB64(iv), data: toB64(new Uint8Array(ciphertext)) })) } catch { throw new Error("Opslag is niet beschikbaar of vol op dit apparaat.") }
}
export function hasPrivateCalendar() { return localStorage.getItem(KEY) !== null }
export async function loadPrivateCalendar(passphrase: string): Promise<PrivateAppointment[]> {
  const stored = localStorage.getItem(KEY)
  if (!stored) throw new Error("Geen versleutelde agenda op dit apparaat gevonden.")
  const record: unknown = JSON.parse(stored)
  if (!record || typeof record !== "object" || !("version" in record) || record.version !== 1 || !("salt" in record) || !("iv" in record) || !("data" in record) || typeof record.salt !== "string" || typeof record.iv !== "string" || typeof record.data !== "string") throw new Error("Ongeldig opslagbestand.")
  const salt = fromB64(record.salt), iv = fromB64(record.iv), data = fromB64(record.data)
  if (salt.length !== 16 || iv.length !== 12 || data.length > 2_000_000) throw new Error("Ongeldig opslagbestand.")
  const key = await derive(passphrase, salt)
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data)
  const parsed: unknown = JSON.parse(dec.decode(plain))
  if (!Array.isArray(parsed) || parsed.length > 2000 || !parsed.every(item => item && typeof item === "object" && typeof item.title === "string" && item.title.length <= 160 && typeof item.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && typeof item.time === "string" && /^$|^\d{2}:\d{2}$/.test(item.time) && typeof item.id === "number" && ["none", "daily", "weekly", "monthly", "yearly"].includes(item.repeat) && typeof item.reminder === "boolean" && (item.place === undefined || typeof item.place === "string" && item.place.length <= 160) && (item.geoId === undefined || typeof item.geoId === "string" && /^\d{1,12}$/.test(item.geoId)) && (item.countryCode === undefined || typeof item.countryCode === "string" && /^[A-Z]{2}$/.test(item.countryCode)))) throw new Error("Ongeldige agenda-inhoud.")
  return parsed as PrivateAppointment[]
}
export function exportEncryptedBackup() {
  const saved = localStorage.getItem(KEY)
  if (!saved) throw new Error("Geen opgeslagen agenda gevonden.")
  return saved
}
export function importEncryptedBackup(raw: string) {
  if (raw.length > 3_000_000) throw new Error("Back-upbestand te groot.")
  const record: unknown = JSON.parse(raw)
  if (!record || typeof record !== "object" || !("version" in record) || record.version !== 1 || !("salt" in record) || !("iv" in record) || !("data" in record) || typeof record.salt !== "string" || typeof record.iv !== "string" || typeof record.data !== "string") throw new Error("Geen geldig VIA-back-upbestand.")
  if (fromB64(record.salt).length !== 16 || fromB64(record.iv).length !== 12 || fromB64(record.data).length > 2_000_000) throw new Error("Ongeldige back-upgegevens.")
  localStorage.setItem(KEY, raw)
}
export function deletePrivateCalendar() { localStorage.removeItem(KEY) }