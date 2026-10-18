type Collection = { PostEntryResponse?: { Body?: string; TimestampNanos?: number; ProfileEntryResponse?: { Username?: string } }; NFTEntryResponses?: Array<{ SerialNumber?: number }> }
export type ExtendedNFTSort = "newest" | "oldest" | "creator" | "serial"
const text = (a: string, b: string) => a.localeCompare(b, "en", { numeric: true, sensitivity: "base" })
function available(value: unknown): number | undefined { return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined }
function compareNumber(a: number | undefined, b: number | undefined, descending = false) {
  if (a === undefined) return b === undefined ? 0 : 1
  if (b === undefined) return -1
  return descending ? b - a : a - b
}
function serial(value: Collection) { return value.NFTEntryResponses?.map(entry => entry.SerialNumber).filter((n): n is number => Number.isSafeInteger(n) && n! > 0).sort((a,b) => a-b)[0] }
export function compareNFTCollections(a: Collection, b: Collection, mode: ExtendedNFTSort) {
  const primary = mode === "creator" ? text(a.PostEntryResponse?.ProfileEntryResponse?.Username ?? "\uffff", b.PostEntryResponse?.ProfileEntryResponse?.Username ?? "\uffff")
    : mode === "serial" ? compareNumber(serial(a), serial(b))
    : compareNumber(available(a.PostEntryResponse?.TimestampNanos), available(b.PostEntryResponse?.TimestampNanos), mode === "newest")
  return primary || text(a.PostEntryResponse?.Body ?? "", b.PostEntryResponse?.Body ?? "")
}
