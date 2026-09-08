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

## Account takeover protection

VIA must assume that a DeSo account can be targeted through phishing, stolen seed phrases, compromised signing material, or an already-authorized session/device.

- The user's 24-word DeSo seed phrase/private key must never be requested, copied, logged, transmitted to, or stored by VIA.
- Knowing a public key is never proof that the current browser controls that wallet.
- Wallet-linked privileges require authoritative proof of wallet control; sensitive on-chain actions require explicit signing/confirmation rather than a VIA-only login.
- VIA session state must contain no private signing material. Logout must clear VIA's non-secret local/session state; VIA must not claim it revoked blockchain authority unless that revocation was actually completed and confirmed.
- Future account-security UI should make wallet/session linkage visible and make suspicious VIA sessions easy to end.
- New or changed wallet/session linkage should be treated as a security-sensitive event suitable for a clear user warning once VIA has an authoritative identity/session event source.
- VIA must not promise recovery of a DeSo account after the underlying seed/private key has been compromised. Recovery/revocation controls may only be presented when supported by the authoritative DeSo identity/wallet mechanism.
- Phishing-resistant UX is preferred: never ask users to paste seed words into VIA, clearly distinguish VIA login from blockchain signing, and do not imitate a seed-entry screen.

## Retained for later review

- Multi-node failover, but only after endpoint compatibility and operational trust are verified per candidate node.
- Moderation/blocklist mechanisms with explicit authority, policy and appeal rules.
- Watermarking as optional preview deterrence, not as copy protection.
- Account-security activity/history and user-facing session management, once VIA has an authoritative source for those events and revocation actions.

## Rejected as active guarantees

- Guaranteed self-healing or fixed-millisecond failover.
- Automatic third-party feature injection from detected external software.
- Public-key equality as proof of admin authority.
- Face ID/Touch ID/passkey presence as proof of legal age.
- Claims that browser media can be made copy-proof.
- Claims that serverless architecture or external providers make VIA legally or technically `100% safe`.
- Claims that VIA can restore or take back control of a DeSo wallet after its seed/private key has been stolen unless the underlying DeSo mechanism actually provides and confirms that recovery path.

Deferred items and reasons are preserved in `docs/PHASE-3.md`.
