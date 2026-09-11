export type ViaSponsorCreativeInspection = {
  mimeType: string
  animated: boolean
  blinking: boolean
  rotating: boolean
  tilting: boolean
}

export type ViaSponsorCreativeDecision =
  | { accepted: true; format: "png" | "jpg" | "webp" }
  | {
      accepted: false
      reason:
        | "unsupported-format"
        | "animated"
        | "blinking"
        | "rotating"
        | "tilting"
    }

export function inspectSponsorCreative(
  input: ViaSponsorCreativeInspection,
): ViaSponsorCreativeDecision {
  const formats = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
  } as const

  const format = formats[input.mimeType as keyof typeof formats]
  if (!format) return { accepted: false, reason: "unsupported-format" }
  if (input.animated) return { accepted: false, reason: "animated" }
  if (input.blinking) return { accepted: false, reason: "blinking" }
  if (input.rotating) return { accepted: false, reason: "rotating" }
  if (input.tilting) return { accepted: false, reason: "tilting" }

  return { accepted: true, format }
}

export const VIA_SPONSOR_CREATIVE_RULES = {
  formats: "Sponsor creative accepts only PNG, JPG/JPEG and WebP.",
  staticOnly:
    "The submitted advertisement must remain static; animation, blinking, rotating and tilting are rejected.",
  exactUpload:
    "Review and later placement refer to the exact approved uploaded creative revision.",
  noSubstitution:
    "VIA does not replace approved sponsor material with a different creative automatically.",
} as const
