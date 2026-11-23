/** @OuwePiet 2026: conservative India headline-region evidence, not verified story geography. */
import { INDIA_REGIONS, type IndiaRegionCode } from "./india-regions";

/** Only explicit full region names in a headline, and only for an India-editorial feed. */
export function indiaHeadlineRegion(title: string, editorialCountry: string): IndiaRegionCode | null {
  if (editorialCountry !== "IN" || !title.trim()) return null;
  const normalized = title.normalize("NFKC").toLocaleLowerCase("en");
  const matches = INDIA_REGIONS.filter(region => {
    const name = region.name.toLocaleLowerCase("en");
    // Punjab also names a Pakistani province. Editorial origin alone cannot disambiguate it.
    // Do not claim the Indian state unless the headline explicitly qualifies it.
    if (region.code === "PB" && !/\b(?:indian\s+punjab|punjab\s*,?\s*india)\b/u.test(normalized)) return false;
    // Scan every occurrence: the first substring may be inside a longer word.
    let at = normalized.indexOf(name);
    while (at >= 0) {
      const before = at === 0 ? "" : normalized[at - 1];
      const after = normalized[at + name.length] || "";
      if ((!before || !/[\p{L}\p{N}]/u.test(before)) && (!after || !/[\p{L}\p{N}]/u.test(after))) return true;
      at = normalized.indexOf(name, at + 1);
    }
    return false;
  });
  // Multiple different region names make a single-region edition misleading.
  return matches.length === 1 ? matches[0].code : null;
}
