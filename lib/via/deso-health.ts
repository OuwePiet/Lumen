export type ViaNodeHealth = {
  endpoint: string
  ok: boolean
  latencyMs?: number
  checkedAt: string
  role: "primary" | "fallback"
}

export type ViaNetworkHealth = {
  available: boolean
  activeEndpoint?: string
  nodes: ViaNodeHealth[]
}

export function chooseHealthyNode(nodes: ViaNodeHealth[]): ViaNetworkHealth {
  const bounded = nodes.slice(0, 8)
  const healthy = bounded
    .filter((node) => node.ok)
    .sort((a, b) => {
      if (a.role !== b.role) return a.role === "primary" ? -1 : 1
      return (a.latencyMs ?? Number.MAX_SAFE_INTEGER) - (b.latencyMs ?? Number.MAX_SAFE_INTEGER)
    })

  return {
    available: healthy.length > 0,
    activeEndpoint: healthy[0]?.endpoint,
    nodes: bounded,
  }
}

/**
 * Health is operational information only. A reachable endpoint is not a trust,
 * consensus or authenticity guarantee; blockchain responses still require the
 * normal VIA/DeSo validation boundaries.
 */
export function healthLabel(health: ViaNetworkHealth) {
  if (!health.available) return "DeSo data endpoints unavailable"
  if (health.nodes.some((node) => node.role === "primary" && node.ok)) return "DeSo data available"
  return "DeSo data available through fallback"
}
