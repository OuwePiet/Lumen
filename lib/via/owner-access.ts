const PUBLIC_KEY_RE = /^[1-9A-HJ-NP-Za-km-z]{20,100}$/

const configuredOwnerPublicKey = (process.env.NEXT_PUBLIC_VIA_OWNER_PUBLIC_KEY ?? "").trim()

export const VIA_OWNER_PUBLIC_KEY = PUBLIC_KEY_RE.test(configuredOwnerPublicKey)
  ? configuredOwnerPublicKey
  : ""

export function isViaOwnerConfigured() {
  return VIA_OWNER_PUBLIC_KEY.length > 0
}

export function isViaOwnerPublicKey(publicKey: string | null | undefined) {
  if (!VIA_OWNER_PUBLIC_KEY || !publicKey) return false
  return publicKey === VIA_OWNER_PUBLIC_KEY
}

export function viaWriteAccessFor(publicKey: string | null | undefined) {
  return {
    ownerConfigured: isViaOwnerConfigured(),
    canWrite: isViaOwnerPublicKey(publicKey),
  }
}
