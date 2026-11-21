/** VIA India — regional navigation registry, no news-source or coverage claims.
 * @OuwePiet 2026. Prepared only; not connected to production UI.
 */
export const INDIA_REGIONS = [
  { code: "AN", name: "Andaman and Nicobar Islands", kind: "union-territory" },
  { code: "AP", name: "Andhra Pradesh", kind: "state" },
  { code: "AR", name: "Arunachal Pradesh", kind: "state" },
  { code: "AS", name: "Assam", kind: "state" },
  { code: "BR", name: "Bihar", kind: "state" },
  { code: "CH", name: "Chandigarh", kind: "union-territory" },
  { code: "CT", name: "Chhattisgarh", kind: "state" },
  { code: "DH", name: "Dadra and Nagar Haveli and Daman and Diu", kind: "union-territory" },
  { code: "DL", name: "Delhi", kind: "union-territory" },
  { code: "GA", name: "Goa", kind: "state" },
  { code: "GJ", name: "Gujarat", kind: "state" },
  { code: "HP", name: "Himachal Pradesh", kind: "state" },
  { code: "HR", name: "Haryana", kind: "state" },
  { code: "JH", name: "Jharkhand", kind: "state" },
  { code: "JK", name: "Jammu and Kashmir", kind: "union-territory" },
  { code: "KA", name: "Karnataka", kind: "state" },
  { code: "KL", name: "Kerala", kind: "state" },
  { code: "LA", name: "Ladakh", kind: "union-territory" },
  { code: "LD", name: "Lakshadweep", kind: "union-territory" },
  { code: "MH", name: "Maharashtra", kind: "state" },
  { code: "ML", name: "Meghalaya", kind: "state" },
  { code: "MN", name: "Manipur", kind: "state" },
  { code: "MP", name: "Madhya Pradesh", kind: "state" },
  { code: "MZ", name: "Mizoram", kind: "state" },
  { code: "NL", name: "Nagaland", kind: "state" },
  { code: "OD", name: "Odisha", kind: "state" },
  { code: "PB", name: "Punjab", kind: "state" },
  { code: "PY", name: "Puducherry", kind: "union-territory" },
  { code: "RJ", name: "Rajasthan", kind: "state" },
  { code: "SK", name: "Sikkim", kind: "state" },
  { code: "TG", name: "Telangana", kind: "state" },
  { code: "TN", name: "Tamil Nadu", kind: "state" },
  { code: "TR", name: "Tripura", kind: "state" },
  { code: "UP", name: "Uttar Pradesh", kind: "state" },
  { code: "UT", name: "Uttarakhand", kind: "state" },
  { code: "WB", name: "West Bengal", kind: "state" },
] as const
export type IndiaRegionCode = (typeof INDIA_REGIONS)[number]["code"]
export const INDIA_PILOT_REGIONS: readonly IndiaRegionCode[] = ["DL", "MH", "KA", "TN", "KL", "WB", "UP"]
export function findIndiaRegion(code: string) {
  return INDIA_REGIONS.find(region => region.code === code.toUpperCase()) ?? null
}