export type PollResponse = {
  associationId: string
  voterPublicKey: string
  option: string
  blockHeight: number | null
}

export type PollResponseStatus = {
  ok: boolean
  responses: PollResponse[]
  existingResponse: PollResponse | null
  multipleResponsesDetected: boolean
  truncated: boolean
  countsFinal: boolean
}

function validPostHash(value: string) {
  return /^[0-9a-fA-F]{64}$/.test(value)
}

function validPublicKey(value: string) {
  return value.length >= 40 && value.length <= 80 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(value)
}

export async function readPollResponseStatus(postHash: string, voterPublicKey: string): Promise<PollResponseStatus> {
  if (!validPostHash(postHash) || !validPublicKey(voterPublicKey)) {
    throw new Error("INVALID_POLL_RESPONSE_LOOKUP")
  }

  const params = new URLSearchParams({ postHash, voter: voterPublicKey })
  const response = await fetch(`/api/via/social/poll-read?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "application/json" },
  })

  const data = await response.json() as {
    ok?: boolean
    responses?: unknown
    truncated?: boolean
    countsFinal?: boolean
    error?: string
  }

  if (!response.ok || !data.ok || !Array.isArray(data.responses)) {
    throw new Error(data.error || "POLL_RESPONSE_LOOKUP_FAILED")
  }

  const responses = data.responses.filter((item): item is PollResponse => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return false
    const value = item as Record<string, unknown>
    return typeof value.associationId === "string"
      && typeof value.voterPublicKey === "string"
      && typeof value.option === "string"
      && (typeof value.blockHeight === "number" || value.blockHeight === null)
  })

  // DeSo can expose more than one POLL_RESPONSE association from the same key.
  // VIA treats that as an ambiguity and must not silently create another vote.
  const existingResponse = responses.length === 1 ? responses[0] : null

  return {
    ok: true,
    responses,
    existingResponse,
    multipleResponsesDetected: responses.length > 1,
    truncated: data.truncated === true,
    countsFinal: data.countsFinal === true,
  }
}
