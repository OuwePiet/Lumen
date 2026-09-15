export const VIA_SETTINGS_KEY = "via:settings:v1"
export const VIA_STUDIO_DRAFT_KEY = "via:studio:draft:v1"

export const VIA_LANGUAGES = ["Dutch", "English", "French", "Spanish", "Chinese"] as const
export const VIA_FEEDS = ["Hot Feed", "Following", "New"] as const

export type ViaLanguage = (typeof VIA_LANGUAGES)[number]
export type ViaFeed = (typeof VIA_FEEDS)[number]

export type ViaLocalSettings = {
  defaultLanguage: ViaLanguage
  defaultFeed: ViaFeed
}

export const DEFAULT_VIA_SETTINGS: ViaLocalSettings = {
  defaultLanguage: "Dutch",
  defaultFeed: "Hot Feed",
}

export function readViaLocalSettings(): ViaLocalSettings {
  if (typeof window === "undefined") return DEFAULT_VIA_SETTINGS
  try {
    const raw = window.localStorage.getItem(VIA_SETTINGS_KEY)
    if (!raw) return DEFAULT_VIA_SETTINGS
    const parsed = JSON.parse(raw) as Partial<ViaLocalSettings> & { defaultFeed?: string }
    const storedFeed = parsed.defaultFeed === "Recent" ? "New" : parsed.defaultFeed
    return {
      defaultLanguage: VIA_LANGUAGES.includes(parsed.defaultLanguage as ViaLanguage) ? parsed.defaultLanguage as ViaLanguage : DEFAULT_VIA_SETTINGS.defaultLanguage,
      defaultFeed: VIA_FEEDS.includes(storedFeed as ViaFeed) ? storedFeed as ViaFeed : DEFAULT_VIA_SETTINGS.defaultFeed,
    }
  } catch {
    return DEFAULT_VIA_SETTINGS
  }
}

export function saveViaLocalSettings(settings: ViaLocalSettings) {
  window.localStorage.setItem(VIA_SETTINGS_KEY, JSON.stringify(settings))
}
