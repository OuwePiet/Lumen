# VIA stock review — batch two

Status: direct-use items from the historical stock, checked against the current viadeso.online baseline.

## Directly adopted

- Graceful degradation when DeSo or another public data source is temporarily unavailable.
- Keep the visitor informed with calm, factual wording instead of an empty screen or a false guarantee that VIA can keep every blockchain function online during an outage.
- Failed reads must not be described as completed writes or changed user data.
- Give visitors useful escape routes to public VIA areas such as Discover, Saved and the homepage when one data-dependent area fails.
- Keep failover lightweight and request-scoped. No always-on monitoring service, database health-log table or heavy node infrastructure is required for this baseline.

## Implemented in this batch

The global VIA error boundary now uses a neutral platform-wide outage state instead of collection-only wording. It explains that DeSo, another public data source or the visitor connection may be temporarily unavailable, confirms that the failed load did not submit or change anything, and offers Try again, Discover, Saved and VIA home.

## Stock ideas deliberately adapted

Historical documents proposed hard-coded lists of third-party DeSo nodes, sub-second guarantees, mandatory Supabase outage logging and claims that commerce would remain "100% online" during infrastructure failures. VIA keeps the useful resilience principle but not those guarantees or dependencies.

The current VIA DeSo adapter already supports a controlled environment-configured node plus the official node.deso.org fallback. Additional third-party nodes should only be added after current endpoint compatibility and trust are verified; they are not silently imported from old documents.

## Still later / discussion

- Read-only content caching for wider offline continuity.
- A public status page or external uptime service.
- Multi-provider storage/cache failover.

These can be useful, but each adds operational, freshness, privacy or cost questions and therefore should not be activated merely because an old document called them necessary.

viadeso.online remains the baseline. Historical project names are source inventory only; the platform is VIA.
