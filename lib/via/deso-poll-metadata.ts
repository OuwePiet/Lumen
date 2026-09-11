import type { ViaPublicPost } from "./deso-post-read"

export type ViaPollMetadataInspection = {
  hasMetadata: boolean
  keys: string[]
  candidates: Array<{ key: string; value: string }>
}

/**
 * Read-only inspection only. DeSo PostExtraData has no poll schema guaranteed by
 * VIA, so candidate metadata must never by itself enable a vote/write action.
 */
export function inspectPollMetadata(post: Pick<ViaPublicPost, "postExtraData">): ViaPollMetadataInspection {
  const entries = Object.entries(post.postExtraData)
  const candidates = entries
    .filter(([key]) => /poll|vote|option|choice/i.test(key))
    .slice(0, 16)
    .map(([key, value]) => ({ key, value }))

  return {
    hasMetadata: entries.length > 0,
    keys: entries.map(([key]) => key).slice(0, 64),
    candidates,
  }
}
