# VIA Resilience Audit

This pass follows the merged Master Audit and compares historical resilience, security and legal documents against the active VIA baseline.

## Adopted now

- Baseline HTTP response hardening in `next.config.mjs`:
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: no-referrer`
  - `X-DNS-Prefetch-Control: off`
  - `Strict-Transport-Security: max-age=31536000`
- Secrets remain outside client code and belong in protected environment configuration.
- Existing DeSo request timeout/retry and no-referrer/credential protections remain the active resilience baseline.

## Retained for later review

- Multi-node failover, but only after endpoint compatibility and operational trust are verified per candidate node.
- Moderation/blocklist mechanisms with explicit authority, policy and appeal rules.
- Watermarking as optional preview deterrence, not as copy protection.

## Rejected as active guarantees

- Guaranteed self-healing or fixed-millisecond failover.
- Automatic third-party feature injection from detected external software.
- Public-key equality as proof of admin authority.
- Face ID/Touch ID/passkey presence as proof of legal age.
- Claims that browser media can be made copy-proof.
- Claims that serverless architecture or external providers make VIA legally or technically `100% safe`.

Deferred items and reasons are preserved in `docs/PHASE-3.md`.
