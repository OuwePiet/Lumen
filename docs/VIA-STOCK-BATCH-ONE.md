# VIA stock review — batch one

Status: approved for direct use against the current viadeso.online baseline.

## Directly adopted

- Keep VIA serverless/lightweight with low fixed infrastructure cost.
- Keep GitHub -> Vercel as the normal deployment route.
- Keep secrets and deployment-specific values out of source code and in environment variables where needed.
- Keep public DeSo data/API use behind a small controlled adapter instead of spreading raw calls through the interface.
- Keep responsive web as the primary delivery model for phone, tablet, laptop and desktop.
- Keep VIA communication factual: no claims such as "best in the world", "hack-proof" or other guarantees that cannot be demonstrated.
- Keep visitor-first discovery, Saved and creator entrances as calm navigation layers instead of turning the homepage into a commercial dashboard.
- Keep storage/creator archive ideas as a useful outside entrance, but only activate provider/pricing/retention claims after the storage track has been verified.

## Implemented in this batch

The DeSo request adapter now supports a lightweight primary-node override through environment configuration while retaining `https://node.deso.org` as the safe default/fallback. The existing two-attempt timeout/retry boundary remains in place, so VIA does not add a node cluster, database, daemon or always-on health service.

Supported configuration:

- `NEXT_PUBLIC_DESO_NODE`: optional HTTPS DeSo node override where browser-visible configuration is appropriate.
- `DESO_NODE`: optional server-side HTTPS DeSo node override.
- Invalid/non-HTTPS values are ignored.
- With no override, VIA continues to use `https://node.deso.org` exactly as before.

This is deliberately small. VIA does not operate its own DeSo node or validator and does not claim that an arbitrary external endpoint is trustworthy merely because it is reachable.

## Already aligned / no extra build needed

GitHub/Vercel deployment, responsive web delivery, low-cost/serverless direction, Saved/Discovery visitor routes and the no-overclaim communication rule were already part of the current VIA baseline. They remain active design constraints rather than being rebuilt as duplicate modules.

## Not silently imported from old stock

Old documents may mention Supabase as mandatory infrastructure, cron jobs, Zapier/Make, Gumroad, WhatsApp commerce, silent signing, automatic software ingestion or heavy multi-provider stacks. Those are not part of this directly approved batch merely because they appeared beside useful ideas in historical documents.

viadeso.online remains the baseline. Historical names are source inventory only; the product name is VIA.
