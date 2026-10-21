import type { ViaLanguage } from "../../app/via-local-settings"

const LOCALES: Record<ViaLanguage, string> = { Dutch: "nl-NL", English: "en-US", French: "fr-FR", Spanish: "es-ES", Chinese: "zh-CN", Hindi: "hi-IN" }

export function nftReadCopy(language: ViaLanguage, input: { username?: string; editions: number; works: number; pages?: number; complete?: boolean }) {
  const number = new Intl.NumberFormat(LOCALES[language])
  const editions = number.format(input.editions), works = number.format(input.works)
  const pages = number.format(input.pages ?? 0)
  const account = input.username ? `@${input.username} — ` : ""
  const summaries: Record<ViaLanguage, string> = {
    Dutch: `${account}${editions} NFT-exemplaren verdeeld over ${works} verschillende NFT's.`,
    English: `${account}${editions} NFT copies across ${works} different NFTs.`,
    French: `${account}${editions} exemplaires NFT répartis sur ${works} NFT différents.`,
    Spanish: `${account}${editions} copias NFT repartidas entre ${works} NFT diferentes.`,
    Chinese: `${account}${works} 个不同 NFT，共 ${editions} 份。`,
    Hindi: `${account}${works} अलग-अलग NFT में ${editions} NFT प्रतियाँ।`,
  }
  const incomplete: Record<ViaLanguage, string> = {
    Dutch: "Wordt nog geladen; dit is niet het definitieve totaal.",
    English: "Still loading; this is not the final total.",
    French: "Chargement en cours ; ce total n’est pas définitif.",
    Spanish: "Cargando; este no es el total definitivo.",
    Chinese: "仍在加载；这不是最终总数。",
    Hindi: "लोड हो रहा है; यह अंतिम कुल नहीं है।",
  }
  const progress: Record<ViaLanguage, string> = {
    Dutch: `${editions} exemplaren en ${works} werken gevonden via ${pages} DeSo-pagina’s.`,
    English: `${editions} editions and ${works} works found across ${pages} DeSo pages.`,
    French: `${editions} exemplaires et ${works} œuvres trouvés sur ${pages} pages DeSo.`,
    Spanish: `${editions} ejemplares y ${works} obras encontrados en ${pages} páginas de DeSo.`,
    Chinese: `已读取 ${pages} 页 DeSo 数据：${works} 件作品，共 ${editions} 份。`,
    Hindi: `${pages} DeSo पृष्ठों में ${works} कृतियाँ और ${editions} प्रतियाँ मिलीं।`,
  }
  return input.pages !== undefined
    ? `${progress[language]} ${incomplete[language]}`
    : `${summaries[language]}${input.complete ? "" : ` ${incomplete[language]}`}`
}
