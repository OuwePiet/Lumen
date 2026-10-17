export const NOTIFICATION_SEEN_EVENT = "via:notifications-seen"
export const notificationSeenKey = (publicKey: string) => `via:notifications:seen-index:${publicKey}`

export function validNotificationIndex(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
}

export function notificationLampIsOn(unreadCount: number, latestIndex: number | null, seenIndex: number | null) {
  return unreadCount > 0 && (latestIndex === null || seenIndex === null || latestIndex > seenIndex)
}

export function readSeenNotificationIndex(publicKey: string): number | null {
  try {
    const raw = window.localStorage.getItem(notificationSeenKey(publicKey))
    if (raw === null || raw.trim() === "") return null
    const value = Number(raw)
    return validNotificationIndex(value) ? value : null
  } catch { return null }
}

/** Acknowledge only a boundary actually rendered during a visible visit. No DeSo write. */
export function acknowledgeNotificationVisit(publicKey: string, latestIndex: number) {
  if (!validNotificationIndex(latestIndex)) return
  try {
    const previous = readSeenNotificationIndex(publicKey)
    window.localStorage.setItem(notificationSeenKey(publicKey), String(Math.max(previous ?? -1, latestIndex)))
    window.dispatchEvent(new CustomEvent(NOTIFICATION_SEEN_EVENT))
  } catch { /* Unavailable storage must never fabricate a persisted acknowledgement. */ }
}
