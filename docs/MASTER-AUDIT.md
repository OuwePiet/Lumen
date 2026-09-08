# VIA Master Audit

VIA / viadeso.online is the active product baseline. Historical Lumen, Vero, Velcon and VIA documents are treated as an idea inventory, not as executable specifications.

## Audit rules

1. Current VIA code wins over legacy naming and architecture.
2. Historical features are adopted only after checking security, DeSo/API assumptions, cost impact, maintainability and user experience.
3. No private seed, derived private key, platform wallet secret or equivalent signing secret may be stored in browser storage or committed to the repository.
4. A wallet identifier is not proof of wallet control. VIA must only grant wallet-linked/on-chain capabilities after an authoritative identity verification step.
5. Claims such as verified, permanent, free, instant, guaranteed or complete require an authoritative source and must not be inferred from UI state.
6. Ideas not adopted yet are recorded in `docs/PHASE-3.md` instead of silently discarded.

## Current audit pass

### Adopt / reinforce

- Responsive public NFT browsing and collection detail flow.
- Read-only DeSo access for guests where possible.
- Explicit capability separation between guest, verified account and wallet-linked account.
- Central DeSo request wrapper with timeout/retry and documented request shaping.
- Factual NFT labels instead of unverified trust badges.

### Reject as-is / Phase 3

- Browser `sessionStorage` or `localStorage` persistence of derived private keys.
- Server/platform seed phrases used as generic gasless relay secrets.
- Automatic admin/reputation badges without an authoritative verification source.
- Undocumented NFT transport pagination assumptions.
- Automatic auction acceptance or payment execution until signing authority, failure recovery and user consent are explicitly designed and tested.

## Next checks

- Harden onboarding validation and make wallet-control verification explicit in the API contract.
- Audit all external links and URL construction for untrusted input.
- Audit image/media fallbacks and NFT metadata parsing.
- Audit accessibility and responsive behavior on mobile/tablet/desktop.
- Audit error/loading states and API failure isolation.
- Compare remaining historical admin, security, update and internationalisation documents against the active code.
