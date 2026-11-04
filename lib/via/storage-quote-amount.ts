/** Provider units stay exact; this is display only, never an exchange rate. */
export function arweaveDisplay(raw: string): string {
  if (!/^\d+$/.test(raw) || raw.length > 40) return "—"
  const padded = raw.replace(/^0+(?=\d)/, "").padStart(13, "0")
  const whole = padded.slice(0, -12)
  const fraction = padded.slice(-12).replace(/0+$/, "")
  return `${whole}${fraction ? "." + fraction : ""} AR`
}
export function storageQuoteAmounts(providerPrice: number, basisPoints: number) {
  if (!Number.isSafeInteger(providerPrice) || providerPrice < 0 || !Number.isSafeInteger(basisPoints) || basisPoints < 0) throw new Error("INVALID_STORAGE_PRICE")
  const provider = BigInt(providerPrice)
  const service = (provider * BigInt(basisPoints) + BigInt(9999)) / BigInt(10000)
  return { service: service.toString(), total: (provider + service).toString() }
}