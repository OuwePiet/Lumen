// @OuwePiet 2026 - VIA / DeSo SDK 3.4.1
// ChatOn interoperability: only non-sensitive routing metadata is read here.
// Sensitive ExtraData must be decrypted separately by DeSo Identity.
export function readRichMessageRouting(extra: unknown) {
  if (!extra || typeof extra !== "object" || Array.isArray(extra)) return null
  const data = extra as Record<string, unknown>
  const raw = data["msg:type"]
  const type = typeof raw === "string" && ["text", "image", "gif", "sticker", "video", "file", "reaction", "system"].includes(raw) ? raw : "text"
  const target = data["msg:replyTo"]
  const replyTo = typeof target === "string" && /^[1-9][0-9]{0,19}$/.test(target) ? target : null
  return { type, replyTo, encrypted: data["msg:encrypted"] === "true" }
}
export function replyExtraData(timestamp?: string): Record<string,string> {
  if (!timestamp) return {}
  if (!/^[1-9][0-9]{0,19}$/.test(timestamp)) throw new Error("INVALID_REPLY_TIMESTAMP")
  return { "msg:replyTo": timestamp }
}
export const replyLabels = {
 Dutch: { action: "Beantwoorden", selected: "Antwoord op bericht", cancel: "Annuleren" },
 English: { action: "Reply", selected: "Reply to message", cancel: "Cancel" },
 French: { action: "Répondre", selected: "Réponse au message", cancel: "Annuler" },
 Spanish: { action: "Responder", selected: "Respuesta al mensaje", cancel: "Cancelar" },
 Chinese: { action: "回复", selected: "回复消息", cancel: "取消" },
 Hindi: { action: "जवाब दें", selected: "संदेश का जवाब", cancel: "रद्द करें" },
} as const