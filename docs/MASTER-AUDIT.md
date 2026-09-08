# VIA Master Audit

VIA / viadeso.online is the active product baseline. Historical Lumen, Vero, Velcon and VIA documents are treated as an idea inventory, not as executable specifications.

## Audit rules

1. Current VIA code wins over legacy naming and architecture.
2. Historical features are adopted only after checking security, DeSo/API assumptions, cost impact, maintainability and user experience.
3. No private seed, derived private key, platform wallet secret or equivalent signing secret may be stored in browser storage or committed to the repository. When a new DeSo account is created, DeSo itself may present the user with the account's 24-word recovery phrase; VIA does not receive, copy, transmit, log, back up or store those words. Derived/session signing keys are a separate security risk and are never silently persisted in browser storage.
4. A wallet identifier is not proof of wallet control. VIA must only grant wallet-linked/on-chain capabilities after an authoritative identity verification step.
5. Claims such as verified, permanent, free, instant, guaranteed or complete require an authoritative source and must not be inferred from UI state.
6. Ideas not adopted yet are recorded in `docs/PHASE-3.md` instead of silently discarded.
7. Media and external URL metadata are untrusted input. VIA must restrict renderable remote media to expected safe protocols and controlled fallbacks.
8. URL/deep-link state and DeSo API metadata are untrusted input. VIA validates known values, lengths, hashes and numeric fields before reusing or rendering them.
9. Session cache is an optional acceleration layer only. DeSo remains authoritative, and cached collection data must pass VIA version, public-key, hash and numeric validation before reuse.
10. Expensive enrichment requests must be isolated from primary NFT retrieval and bounded so one large collection or edition cannot create an uncontrolled request burst.

## Current audit pass

### Adopt / reinforce

- Responsive public NFT browsing and collection detail flow.
- Read-only DeSo access for guests where possible.
- Explicit capability separation between guest, verified account and wallet-linked account.
- Central DeSo request wrapper with timeout/retry, endpoint validation, credential/referrer suppression and documented request shaping.
- Factual NFT labels instead of unverified trust badges.
- HTTPS-only remote NFT media rendering, with `ipfs://` metadata translated to fixed HTTPS gateway candidates.
- Media fallback state reset whenever a different NFT source is shown.
- HTTPS-only DeSo profile images with a local VIA fallback avatar.
- One authoritative `get-nfts-for-user` request contract followed by client-side presentation paging.
- Validated NFT return-link and collection-share state instead of blindly reflecting query parameters.
- Normalized public NFT metadata with 64-hex PostHash validation and finite non-negative numeric fields.
- Versioned VIA session cache with structural validation and no automatic legacy Lumen-cache migration.
- Best-effort profile enrichment with isolated failures and bounded DeSo profile lookup concurrency.
- Mobile-first touch targets, wrapping and live status feedback on account, collection and edition-owner controls.

### Reject as-is / Phase 3

- Browser `sessionStorage` or `localStorage` persistence of derived private keys.
- Server/platform seed phrases used as generic gasless relay secrets.
- Automatic admin/reputation badges without an authoritative verification source.
- Undocumented NFT transport pagination assumptions.
- Automatic auction acceptance or payment execution until signing authority, failure recovery and user consent are explicitly designed and tested.
- Autonomous update-sensor/hot-reload claims that imply guaranteed instant global deployment or recovery.
- Cross-chain/payment expansion until custody, signing, fees, legal scope, failure handling and user consent are explicitly designed and reviewed.

## Completed checks in this pass

- Hardened onboarding validation and made wallet-control verification explicit in the API contract.
- Audited NFT media source construction and blocked arbitrary non-HTTPS remote protocols.
- Added deterministic IPFS HTTPS fallback candidates and corrected gateway copy in the UI.
- Reset media fallback state between NFT source changes.
- Replaced the remaining `DeSo verified` NFT detail badge with the factual `On-chain NFT` label.
- Enforced the documented NFT collection request/response contract centrally and removed the legacy cursor loop from the active collection component.
- Restricted remote DeSo profile pictures to HTTPS and removed referrer leakage.
- Validated NFT deep-link, share and return state against known values and bounded text lengths.
- Hardened central NFT metadata parsing so malformed hashes, URL arrays and invalid numeric values are discarded instead of propagated.
- Replaced unvalidated legacy collection-cache restoration with a versioned VIA cache contract tied to the selected public key.
- Improved account search, NFT collection filters, NFT detail facts and edition-owner controls for mobile/accessibility use.
- Isolated owner/profile enrichment failures so a failed profile lookup cannot collapse NFT detail rendering.
- Bounded concurrent `get-single-profile` enrichment calls to reduce request bursts on large edition NFTs.
- Compared historical security, admin, testing, update and internationalisation ideas against current VIA rules; unsupported automatic signing, relay, update guarantees and cross-chain/payment assumptions remain in Phase 3.

## Verification status

- The PR branch is 22 commits ahead of `main` and 0 commits behind; its merge base matches the current `main` commit used for this audit pass.
- GitHub reports PR #103 as mergeable and rebaseable with `mergeable_state: clean` after recalculation.
- Vercel preview builds for the replacement NFT collection loader, NFT-detail profile failure isolation, edition-owner mobile accessibility and bounded DeSo profile concurrency have completed successfully.
- GitHub Actions is not configured for this branch; Vercel preview builds are therefore the active compile/deploy signal for this pass.
- Protected preview authentication prevents an unauthenticated visual walkthrough through the connector, so a successful build is not treated as proof that every interactive user path has been manually exercised.

## Next audit cycle

- Continue comparing remaining historical documents and new proposals against the same VIA baseline.
- Add targeted interaction tests when a suitable automated browser or test workflow is available for the authenticated preview environment.
- Revisit Phase 3 items individually only when their signing, custody, source-of-truth, cost and recovery assumptions can be verified.
