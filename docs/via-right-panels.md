# VIA right-side panels

Canonical scope for VIA-owned right-side panels. These panels are VIA components, not copies of third-party interfaces.

## VIA Live
- Show how many visitors are currently active.
- Show names only for active signed-in DeSo accounts.
- Show visitors without DeSo only as an anonymous count.
- Show presence per country only at country level.
- Never expose precise location.

## VIA Visitors
- Unique visitors today when a reliable source exists.
- Unique visitors this month when a reliable source exists.
- Unique visitors this year when a reliable source exists.
- Do not show guessed, local-only, reset-on-refresh, or otherwise unreliable counters.

## VIA Activity
- Public platform activity such as posts, active creators, trends, and NFT activity.
- Every metric must state its real source and time window.

## VIA Community
- Optional future panel for Welcome / First Post, new creators, and community activity.
- Do not label an account as a bot, hacked, compromised, or abusive without reliable evidence.

## Privacy and trust
- No names for anonymous visitors.
- No precise visitor location.
- Country aggregation only.
- Presence names are for genuinely active signed-in DeSo accounts only.
- No fake live indicators or placeholder numbers presented as real data.
- If a reliable measurement source is unavailable, hide the metric or show a clear unavailable state.

## Responsive layout
- Desktop/iPad: separate cards stacked in a right-side column.
- iPhone: compact collapsible panels; no forced desktop sidebar.
- Keep the main VIA page usable if the panels are unavailable.

## Build rule
The visual shell may be prepared separately, but no visitor/presence numbers go live until a reliable measurement source is connected and tested.
