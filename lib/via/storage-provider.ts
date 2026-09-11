export type ViaStorageProviderKind =
  | "creator-url"
  | "ipfs"
  | "permanent"
  | "managed-external"

export type ViaStorageProvider = {
  id: string
  label: string
  kind: ViaStorageProviderKind
  contentAddressed: boolean
  permanenceClaim: "none" | "provider-dependent" | "permanent"
  billing: "creator-direct" | "via-facilitated"
  enabled: boolean
}

export function normalizeStorageProvider(
  input: Partial<ViaStorageProvider>
): ViaStorageProvider | null {
  const id = typeof input.id === "string" ? input.id.trim().slice(0, 64) : ""
  const label = typeof input.label === "string" ? input.label.trim().slice(0, 120) : ""
  const kinds: ViaStorageProviderKind[] = [
    "creator-url",
    "ipfs",
    "permanent",
    "managed-external",
  ]

  if (!id || !label || !input.kind || !kinds.includes(input.kind)) return null

  return {
    id,
    label,
    kind: input.kind,
    contentAddressed: input.contentAddressed === true,
    permanenceClaim:
      input.permanenceClaim === "permanent" ||
      input.permanenceClaim === "provider-dependent"
        ? input.permanenceClaim
        : "none",
    billing: input.billing === "via-facilitated" ? "via-facilitated" : "creator-direct",
    enabled: input.enabled === true,
  }
}
