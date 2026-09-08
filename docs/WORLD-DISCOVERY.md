# VIA World Discovery

World Discovery is a read-only discovery layer for VIA. It helps people explore DeSo creators, posts, NFTs and World Radio without requiring a wallet transaction.

## First release

- **Around the World** — discovery entry point for creators and public content with geographic context only where that context is explicitly public and trustworthy.
- **New Voices** — surface public creators/content without claiming endorsement or verification.
- **NFT Window** — discovery entry point into VIA's existing DeSo NFT browsing.
- **World Radio** — link into the verified World Radio directory/player.
- **Surprise Me** — deterministic/read-only navigation among safe discovery destinations; no financial reward or chance-based payout.

## Product rules

1. Read-only by default. Discovery must not silently sign, submit or broadcast blockchain transactions.
2. Public key or username is identity context, not proof of VIA verification or admin authority.
3. Organic discovery and paid placement must be visibly distinguishable. Sponsorship is always labelled.
4. Do not infer or expose sensitive personal data. Country/location discovery may use only explicit public metadata with a known source.
5. No fake popularity, endorsement, availability, verification or ranking claims.
6. External media and services remain external; VIA must not claim ownership or rights it does not have.
7. DeSo/network/provider failures degrade gracefully and should not erase already available safe content.
8. Keep initial implementation low-cost and deterministic. Add scoring/ranking only when the inputs and abuse controls are understood.

## Implementation order

1. Create `/discover` as a responsive VIA navigation/discovery hub.
2. Reuse existing verified/read-only VIA data loaders where possible instead of adding duplicate DeSo calls.
3. Add live creator/post discovery only after current DeSo read endpoints and response fields are verified against the implementation.
4. Add geographic sections only after the source of location/country data is explicit and suitable for public display.
5. Record unsupported or legally/security-sensitive ideas in `docs/PHASE-3.md` rather than presenting them as working features.
