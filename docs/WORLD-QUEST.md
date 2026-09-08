# VIA World Quest

## Purpose
VIA World Quest turns discovery into a lightweight, global game inside VIA. It connects DeSo creators, NFTs, VIA World Radio and World Discovery without making normal VIA use pay-to-play.

Tagline: **Play the world, discover DeSo.**

## MVP game loop
1. Open the Daily Quest or Surprise Route.
2. Complete a short sequence of discovery steps.
3. Examples: discover a creator from another country, inspect an NFT, visit a public post, or choose a World Radio station.
4. Complete a simple knowledge/discovery question when appropriate.
5. Earn VIA Points, a badge or streak progress.

## Modes
- **Daily Quest** — one short route each day.
- **Surprise Route** — a randomized journey across countries and VIA discovery areas.
- **Around the World** — themed country/region routes.
- **NFT Quest** — discover collections and public NFT information.
- **Creator Quest** — later, creators may prepare their own discovery route subject to moderation and clear sponsorship labels.

## Rewards and safety boundary
For the first implementation VIA Points are in-app reputation/game points only. They are not money, crypto, transferable tokens, lottery tickets, investment products or redeemable cash value. No purchase is required to play the basic quests.

Initial rewards can include:
- non-transferable VIA badges;
- streak milestones;
- profile/game achievements;
- cosmetic themes or collection cards;
- access to curated discovery views.

Any future financial, token, prize, sweepstakes or chance-based reward requires a separate legal, security and abuse review before implementation.

## Fair discovery
Organic discovery remains available without payment. Sponsored Creator Quests, featured collections or other commercial placements must be clearly marked as sponsored/paid and must not secretly alter earned quest results.

## Privacy and security
- No DeSo seed phrase, private key or signing secret is required for the read-only MVP.
- Do not infer location from precise device location for gameplay unless a later feature explicitly asks for consent.
- Country/region discovery is content metadata, not proof of a creator's identity or residence.
- Treat external metadata, URLs, radio metadata and creator-supplied quest text as untrusted input.
- Do not auto-open arbitrary external links or execute creator-provided HTML/scripts.

## Anti-abuse
Points and streaks are local/account-level game state until authoritative account storage is designed. Do not present client-only state as tamper-proof. Creator-sponsored quests need moderation/reporting controls before public self-service launch.

## Monetisation
Potential revenue, only after the corresponding feature is implemented safely:
- clearly labelled Sponsored Creator Quest;
- clearly labelled Featured NFT Collection;
- clearly labelled Sponsored Station/route partner;
- optional brand/cultural routes.

Normal Daily Quest and Surprise Route should remain usable for free.

## Implementation order
1. Read-only `/quest` shell with Daily Quest and Surprise Route.
2. Local non-sensitive progress, points and streak prototype.
3. Connect only verified VIA discovery sources.
4. Add badges/achievements.
5. Add account sync only after VIA account authority is established.
6. Creator Quest tooling only after moderation, sponsorship disclosure and abuse controls exist.

## Definition of done for first playable version
A phone, tablet or desktop visitor can start a quest, move through several safe read-only VIA discovery steps, finish it, see local points/streak progress and replay a Surprise Route without wallet signing or entering sensitive credentials.
