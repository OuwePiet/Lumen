# VIA Phase 3 — Not adopted / discuss

This file records relevant ideas that are deliberately not adopted into the active VIA build yet. Nothing is silently discarded.

## Verification labels

- **Idea:** Automatically show a `DeSo verified` badge on every NFT card.
- **Source:** Existing VIA/Lumen implementation and earlier blueprint discussions around verification badges.
- **Why not adopted as-is:** The current card code does not verify an authoritative DeSo verification field before rendering the badge. Showing the badge for every creator would create a false trust signal.
- **Current decision:** Replace the unconditional label with the factual `On-chain NFT` label. A real verification badge can return only after VIA has a reliable verification source and explicit mapping rules.
- **Discussion status:** Open for later review.

## Undocumented NFT cursor pagination

- **Idea:** Page through `get-nfts-for-user` with `LastKeyHex` and `Limit` and merge the returned pages client-side.
- **Source:** Legacy VIA/Lumen public collection loader.
- **Why not adopted as-is:** The DeSo endpoint contract currently used by VIA documents the user key, reader key and optional sale/pending filters, but VIA has not verified `LastKeyHex`, `Limit`, or a returned NFT cursor as part of that contract.
- **Technical risk:** Depending on unverified cursor fields can create false completeness assumptions for large collections and makes the gallery harder to reason about.
- **Current decision:** Keep the central request guard that strips unverified request fields and move the gallery toward the documented `getNFTsForUser` loader. Do not claim server-side pagination until the deployed DeSo contract is verified.
- **Alternative:** Retain VIA's client-side 25-item presentation paging after one authoritative collection load; revisit transport pagination if DeSo documents or verifies a cursor contract.
- **Discussion status:** Recorded for later review; no NFT functionality is intentionally discarded.

## Legacy NFT session cache migration

- **Idea:** Restore historical `lumen:account-nfts:*` or current `via:account-nfts:*` session cache entries directly as NFT collections.
- **Source:** Existing public NFT gallery cache migration code.
- **Why not adopted as fully trusted:** Session cache is non-secret and useful for navigation speed, but old entries can outlive schema changes or contain partial/malformed data. An array check alone is not enough to establish that cached NFT objects still satisfy VIA's current metadata contract.
- **Current decision:** Keep session caching as a performance aid only. Fresh DeSo data remains authoritative. Cache restoration must move to the same structural validation used for live NFT data before old Lumen cache migration can be considered complete.
- **Discussion status:** Migration hardening still open; no private material may ever be stored in this cache.

## Silent derived private keys in browser storage

- **Idea:** Store a derived private key in `sessionStorage` so later on-chain actions can run without repeated user prompts.
- **Source:** Historical Lumen login/test documents.
- **Why not adopted as-is:** Browser storage is not an acceptable trust boundary for signing secrets. The proposal also blurs the distinction between convenient login and explicit authority to sign blockchain transactions.
- **Current decision:** VIA may store non-secret session state, but private signing material must not be persisted in `sessionStorage` or `localStorage`. Wallet-linked capabilities are granted only after an authoritative identity-control verification step.
- **Discussion status:** Security rule; any future low-friction signing design must be separately reviewed.

## Platform-seed gasless relay

- **Idea:** Use a centrally stored platform seed phrase in a relay service to sponsor and submit transactions for users.
- **Source:** Historical advanced-modules/test material.
- **Why not adopted as-is:** A reusable platform seed becomes a high-impact signing secret and creates custody, abuse, rate-limit, compromise and recovery responsibilities that are not designed in the current VIA architecture.
- **Current decision:** Do not introduce a platform seed or generic signing relay into the active build. Gas sponsorship can be reconsidered only with a narrowly scoped signing model, explicit limits, monitoring and recovery design.
- **Discussion status:** Open for later architecture review.

## Automatic auction acceptance

- **Idea:** Let a cron job automatically accept the highest NFT bid when a VIA auction timer expires.
- **Source:** Historical master/test documents.
- **Why not adopted as-is:** Automatic settlement requires verified signing authority, clear user consent, deterministic failure handling, chain-state reconciliation and protection against stale bids or timing races.
- **Current decision:** Keep auction timing as a future module until the signing and recovery model is proven. Native DeSo bid state can still be displayed read-only.
- **Discussion status:** Open for later product/security review.

## Autonomous update sensors and guaranteed hot reload

- **Idea:** Treat every code/database update as instantly self-propagating to all active browsers, with autonomous fallback routing and no manual intervention.
- **Source:** Historical Vero/Lumen update documents (`Google-handmatig update knop-bestaat al?.docx` and related update-sensor material).
- **Why not adopted as-is:** Git/Vercel deployment automation is reasonable, but claims of universal instant hot reload, guaranteed millisecond propagation, zero downtime under every condition and autonomous fallback behaviour are not established by the active VIA architecture.
- **Current decision:** Keep ordinary Git-to-Vercel deployment automation as infrastructure practice. Do not add custom realtime update sensors or fallback routers unless a concrete product need, data source, failure model and test plan exist.
- **Discussion status:** Infrastructure principle adopted; custom autonomous update machinery deferred.

## Automatic node rotation and self-healing fallback

- **Idea:** Continuously health-check infrastructure and switch the browser automatically across public DeSo nodes whenever the primary route is slow or unavailable.
- **Source:** Historical `Google node rotetor, bij storing.docx` and `Google-beveiliging-bij uitval Velcon-Github.docx` material.
- **Why not adopted as-is:** The resilience principle is useful, but the historical implementation assumes that several third-party hosts expose interchangeable API contracts and promises fixed failover timings and uninterrupted availability without verified health, compatibility, rate-limit or trust guarantees.
- **Current decision:** Keep the active `node.deso.org` request wrapper with timeout/retry. A real multi-node fallback may be added only after each candidate node is explicitly verified for the endpoints VIA uses, with bounded retries, deterministic ordering, no credential/referrer leakage, and no claim of guaranteed uptime.
- **Discussion status:** Architecture direction retained; unverified node list and self-healing guarantees deferred.

## Autonomous third-party software detection and live implementation

- **Idea:** Continuously scan competitors/protocols, classify detected features as safe, and inject newly discovered Web3 components into VIA automatically without a reviewed code release.
- **Source:** Historical update/detection documents including `Google detectie sensor voor gesignaleerde updates.docx` and `Google-detectie nieuwe software-derde.docx`.
- **Why not adopted as-is:** Runtime feature injection from external metadata creates supply-chain, XSS, provenance and product-integrity risks. A regex scan or label such as `Geverifieerd Web3 Protocol` is not an authoritative security review.
- **Current decision:** Monitoring and benchmarking may inform human-reviewed development, but production features must enter VIA through normal reviewed source changes and Vercel deployments. Do not render untrusted external descriptions through `innerHTML` or automatically install discovered integrations.
- **Discussion status:** Monitoring principle retained; autonomous implementation rejected.

## Legal blocklists and 18+ biometric claims

- **Idea:** Hide blocked on-chain posts by hash/wallet and treat Face ID/Touch ID/passkey confirmation as proof that a viewer is an adult.
- **Source:** Historical `Google-beveiliging-18+-en verboden middelen..docx` material.
- **Why not adopted as-is:** A content blocklist can be a valid moderation mechanism, but its policy source, update authority, appeals process and scope must be explicit. Device biometrics/passkeys authenticate device/user possession; they do not by themselves establish legal age, so presenting them as age verification would be misleading.
- **Current decision:** Retain the concept of platform-level visibility controls for later moderation design. Do not claim biometric/passkey use proves age. Any future age-gating or restricted-content system requires a separately reviewed legal/product design and clear data-minimisation rules.
- **Discussion status:** Moderation direction retained; legal-age verification claim deferred.

## International payments, regional badges and cross-chain bridging

- **Idea:** Add India/China payment methods, region-based creator badges, imported external verification and direct L2/cross-chain NFT bridging.
- **Source:** Historical internationalisation and 2027 roadmap documents.
- **Why not adopted as-is:** These features add payment-provider, regulatory, reputation and cross-chain trust dependencies that are outside the current read-only/social/NFT browsing baseline. Region badges also risk creating unsupported status signals if criteria are not explicit and verifiable.
- **Current decision:** Keep localisation, data-efficient mobile UX and language support as valid product directions. Defer payment rails, external verification imports, region ranking badges and bridging until separate product/security/legal review.
- **Discussion status:** Roadmap material retained for later review.
