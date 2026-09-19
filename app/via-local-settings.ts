export const VIA_SETTINGS_KEY = "via:settings:v1"
export const VIA_SETTINGS_EVENT = "via:settings"
export const VIA_STUDIO_DRAFT_KEY = "via:studio:draft:v1"

export const VIA_LANGUAGES = ["Dutch", "English", "French", "Spanish", "Chinese", "Hindi"] as const
export const VIA_FEEDS = ["Hot Feed", "Following", "New"] as const

export type ViaLanguage = (typeof VIA_LANGUAGES)[number]
export type ViaFeed = (typeof VIA_FEEDS)[number]

export type ViaLocalSettings = {
  interfaceLanguage: ViaLanguage
  defaultLanguage: ViaLanguage
  defaultFeed: ViaFeed
}

export const DEFAULT_VIA_SETTINGS: ViaLocalSettings = {
  interfaceLanguage: "English",
  defaultLanguage: "Dutch",
  defaultFeed: "Hot Feed",
}

export function readViaLocalSettings(): ViaLocalSettings {
  if (typeof window === "undefined") return DEFAULT_VIA_SETTINGS
  try {
    const raw = window.localStorage.getItem(VIA_SETTINGS_KEY)
    if (!raw) return DEFAULT_VIA_SETTINGS
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const storedLanguage = typeof parsed.defaultLanguage === "string" ? parsed.defaultLanguage : ""
    const storedInterfaceLanguage = typeof parsed.interfaceLanguage === "string" ? parsed.interfaceLanguage : storedLanguage
    const rawFeed = typeof parsed.defaultFeed === "string" ? parsed.defaultFeed : ""
    const storedFeed = rawFeed === "Recent" ? "New" : rawFeed
    return {
      interfaceLanguage: VIA_LANGUAGES.includes(storedInterfaceLanguage as ViaLanguage) ? storedInterfaceLanguage as ViaLanguage : DEFAULT_VIA_SETTINGS.interfaceLanguage,
      defaultLanguage: VIA_LANGUAGES.includes(storedLanguage as ViaLanguage) ? storedLanguage as ViaLanguage : DEFAULT_VIA_SETTINGS.defaultLanguage,
      defaultFeed: VIA_FEEDS.includes(storedFeed as ViaFeed) ? storedFeed as ViaFeed : DEFAULT_VIA_SETTINGS.defaultFeed,
    }
  } catch {
    return DEFAULT_VIA_SETTINGS
  }
}

export function saveViaLocalSettings(settings: Partial<ViaLocalSettings>) {
  const current = readViaLocalSettings()
  window.localStorage.setItem(VIA_SETTINGS_KEY, JSON.stringify({ ...current, ...settings }))
  window.dispatchEvent(new CustomEvent(VIA_SETTINGS_EVENT))
}
