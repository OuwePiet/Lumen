export type MintCurrency = "DESO" | "USD" | "EUR"

function decimal(value: string, places: number): { units: bigint; scale: bigint } | null {
  const normalized = value.trim().replace(",", ".")
  if (!/^\d+(?:\.\d+)?$/.test(normalized) || normalized.length > 40) return null
  const [whole, fraction = ""] = normalized.split(".")
  if (fraction.length > places) return null
  return { units: BigInt(whole + fraction), scale: BigInt("1" + "0".repeat(fraction.length)) }
}

/** Exact decimal input; fiat conversion rounds once to DeSo's internal unit. */
export function mintPriceNanos(value: string, currency: MintCurrency, fiatPerDeso?: number): number | null {
  const amount = decimal(value, currency === "DESO" ? 9 : 2)
  if (!amount) return null
  let result: bigint
  if (currency === "DESO") result = amount.units * BigInt(1_000_000_000) / amount.scale
  else {
    if (typeof fiatPerDeso !== "number" || !Number.isFinite(fiatPerDeso) || fiatPerDeso <= 0) return null
    const rate = decimal(fiatPerDeso.toFixed(12).replace(/0+$/, "").replace(/\.$/, ""), 12)
    if (!rate || rate.units === BigInt(0)) return null
    const numerator = amount.units * BigInt(1_000_000_000) * rate.scale
    const denominator = amount.scale * rate.units
    result = (numerator + denominator / BigInt(2)) / denominator
  }
  if (result > BigInt(Number.MAX_SAFE_INTEGER) || (amount.units > BigInt(0) && result === BigInt(0))) return null
  return Number(result)
}
