/** Never derive a financial edition number from an array position. */
export function actionableNFTEntries<T extends { SerialNumber?: number; OwnerPublicKeyBase58Check?: string; IsPending?: boolean; IsForSale?: boolean }>(entries: T[]) {
  const counts = new Map<number, number>()
  for (const entry of entries) if (typeof entry.SerialNumber === "number") counts.set(entry.SerialNumber, (counts.get(entry.SerialNumber) ?? 0) + 1)
  return entries.filter((entry): entry is T & { SerialNumber: number; OwnerPublicKeyBase58Check: string; IsPending: boolean; IsForSale: boolean } =>
    typeof entry.SerialNumber === "number" && Number.isSafeInteger(entry.SerialNumber) && entry.SerialNumber > 0 && counts.get(entry.SerialNumber) === 1 &&
    typeof entry.OwnerPublicKeyBase58Check === "string" && /^[1-9A-HJ-NP-Za-km-z]{40,128}$/.test(entry.OwnerPublicKeyBase58Check) &&
    typeof entry.IsPending === "boolean" && typeof entry.IsForSale === "boolean")
}
