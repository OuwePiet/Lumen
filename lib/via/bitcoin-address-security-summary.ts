export const VIA_BITCOIN_RECEIVER_SECURITY_SUMMARY = {
  required:
    "Bitcoin remains unavailable until the VIA-owner supplies a valid public bitcoin-mainnet receiving address and all other Bitcoin dependencies are ready.",
  secretFree:
    "Receiver configuration accepts only a public address; private keys and seed phrases are never requested, stored or used.",
  owner:
    "Adding/replacing the receiver is owner-only and requires fresh re-authentication plus explicit confirmation.",
  verify:
    "The owner verifies the complete normalized address and bitcoin-mainnet network in a short-lived protected preview before commit.",
  binding:
    "Preview, confirmation and commit are bound to one single-use server-side change session; exact preview/address matching is required.",
  requests:
    "Changes are POST-only, same-origin, CSRF-protected, JSON-only, strictly allowlisted/bounded and idempotent.",
  abuse:
    "Configuration attempts are server-side rate-limited, fail closed and use non-leaking errors.",
  history:
    "Successful changes are privately audited with safe metadata/fingerprint and affect new payment requests only.",
  authority:
    "Receiver configuration never grants VIA custody and performs no Bitcoin signing, payment confirmation, forwarding or blockchain write.",
} as const

export const VIA_BITCOIN_RECEIVER_SECURITY_REVIEW = {
  status: "boundary-complete",
  outstanding:
    "The real public Bitcoin mainnet receiving address is intentionally still absent and must be supplied by the owner through protected deployment/admin configuration before Bitcoin can become ready.",
} as const
