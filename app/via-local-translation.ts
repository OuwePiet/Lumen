export type ViaTranslationResult = { text: string; message: string }

export async function translateViaTextLocally(text: string, targetLanguage: string): Promise<ViaTranslationResult> {
  if (!text.trim()) return { text: "", message: "This post has no text to translate." }
  type LocalTranslator = { translate: (text: string) => Promise<string> }
  type BrowserTranslator = { create: (options: { sourceLanguage: string; targetLanguage: string }) => Promise<LocalTranslator> }
  const browser = globalThis as typeof globalThis & { Translator?: BrowserTranslator }
  if (!browser.Translator) return { text: "", message: "Translation is not supported by this browser. Copy the original text to translate with your preferred app." }
  try {
    const detector = globalThis as typeof globalThis & {
      LanguageDetector?: { create: () => Promise<{ detect: (text: string) => Promise<Array<{ detectedLanguage: string; confidence: number }>> }> }
    }
    if (!detector.LanguageDetector) throw new Error("DETECTION_UNAVAILABLE")
    const model = await detector.LanguageDetector.create()
    const detected = await model.detect(text)
    const sourceLanguage = detected[0]?.detectedLanguage
    if (!sourceLanguage || sourceLanguage === "und") throw new Error("LANGUAGE_UNAVAILABLE")
    if (sourceLanguage === targetLanguage) return { text, message: "" }
    const translator = await browser.Translator.create({ sourceLanguage, targetLanguage })
    return { text: await translator.translate(text), message: "" }
  } catch {
    return { text: "", message: "Local translation is unavailable for this language or browser. Copy the original text to use your preferred translator." }
  }
}
