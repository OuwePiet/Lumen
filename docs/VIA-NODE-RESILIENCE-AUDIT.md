# VIA Node Resilience Audit

VIA / viadeso.online remains the active baseline. This note evaluates the historical node-rotation proposal against the current VIA architecture.

## Retain

- Avoid relying conceptually on a single DeSo read endpoint forever.
- Keep timeouts, bounded retries and graceful error states in the central DeSo request layer.
- Treat node failover as resilience, not as proof that VIA or DeSo can never be unavailable.
- Keep read-only fallback behavior separate from any signing or transaction path.
- Preserve clear visitor messaging when live DeSo data cannot be reached.

## Do not adopt as written

- Do not claim that a node router guarantees VIA is always online.
- Do not hard-code historical alternative nodes unless each endpoint is currently verified for API compatibility, availability, trust, rate limits and CORS behavior.
- Do not silently send signed or wallet-authorized traffic to an unverified fallback node.
- Do not add an own read-only node merely to satisfy an old architecture document; VIA currently aims to avoid operating its own server/node infrastructure.
- Do not treat a cached copy as authoritative blockchain state. DeSo remains authoritative.
- Do not claim that an off-chain cache makes VIA fully usable during a total DeSo network outage. On-chain reads/writes and any ownership-sensitive state would still be unavailable or stale.

## Safe future design

A future multi-node read strategy may be added only after:

1. candidate node endpoints are explicitly verified;
2. endpoint/API compatibility is tested per route;
3. timeout and retry budgets are bounded;
4. stale data is visibly labelled and never presented as live authoritative state;
5. write/signing traffic has a separately reviewed trust boundary;
6. failure telemetry does not log secrets or sensitive wallet material.

## Phase 3 decision

The resilience principle is retained. The historical fixed node list, 1.5-second universal timeout, automatic cache survival mode and absolute uptime claims remain deferred until the current DeSo node landscape and API contracts are verified. VIA must prefer graceful degradation over unverifiable guarantees.
