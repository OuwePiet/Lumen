export type ViaBitcoinAddressPreviewFreshness =
  | { fresh: true }
  | { fresh: false; reason: "invalid-time" | "preview-expired" }

export function bitcoinAddressPreviewFreshness(input: {
  previewCreatedAtMs: number
  nowMs: number
  maxAgeMs: number
}): ViaBitcoinAddressPreviewFreshness {
  if (
    !Number.isSafeInteger(input.previewCreatedAtMs) ||
    !Number.isSafeInteger(input.nowMs) ||
    !Number.isSafeInteger(input.maxAgeMs) ||
    input.maxAgeMs < 1 ||
    input.nowMs < input.previewCreatedAtMs
  ) {
    return { fresh: false, reason: "invalid-time" }
  }

  return input.nowMs - input.previewCreatedAtMs <= input.maxAgeMs
    ? { fresh: true }
    : { fresh: false, reason: "preview-expired" }
}

export const VIA_BITCOIN_ADDRESS_PREVIEW_FRESHNESS_RULES = {
  shortLived:
    "The protected Bitcoin receiver confirmation preview is short-lived and cannot be reused indefinitely.",
  serverClock:
    "Production freshness uses trusted server-side timestamps and a deployment-configured maximum age.",
  expire:
    "An expired preview requires a fresh owner re-auth/preview/confirmation cycle before receiver configuration can be committed.",
  noExtend:
    "Viewing or retrying the confirmation does not extend the original preview lifetime.",
  noEffects:
    "Freshness validation performs no Bitcoin signing, payment confirmation, refund, settlement, forwarding or blockchain write.",
} as const
