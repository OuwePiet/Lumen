# VIA Authentication Audit

viadeso.online remains the active VIA baseline. Historical login proposals are treated as idea stock, not as production-ready authentication code.

## Retain

- A simple login experience is a valid VIA goal.
- Passkeys/WebAuthn are a strong future direction for low-friction authentication when implemented with a real server challenge, registered credentials, replay protection and verified origin/RP-ID handling.
- Google/e-mail login may be useful as an account-authentication layer, but authentication to VIA and authority to sign DeSo transactions are separate capabilities.
- VIA should feature-detect authentication methods and provide accessible fallbacks instead of assuming one browser/device flow.
- Cross-chain sign-in may be explored later, but only after an explicit account-linking model is designed and verified.

## Reject from the historical code

The historical code requests a 30-day Derived Key with an `UNLIMITED` spending limit and stores private derived-key material in `sessionStorage`. VIA must not implement this. Browser storage is not an acceptable vault for silent signing authority, and unrestricted spending limits violate VIA's bounded-permission principle.

A passkey credential ID must not be treated as a decryption key or as proof that a DeSo signing key can safely be unlocked. WebAuthn authenticates a credential under a relying party; it does not by itself create safe DeSo transaction authority.

A locally generated WebAuthn challenge is not sufficient for a secure login ceremony. Any production passkey flow requires a server-generated, single-use challenge bound to a session/account and verified server-side.

## Separate authentication from signing

Future VIA capability layers should remain explicit:

1. **Guest/read-only** — browse public DeSo data without login.
2. **Authenticated VIA account** — a verified VIA session, potentially via passkey or supported social login.
3. **Linked DeSo identity** — an account relation established through a verified linking ceremony, not by typing a username/public key.
4. **Wallet/on-chain authority** — explicit, bounded signing permission with clear user consent for consequential actions.

No layer may silently imply the next one.

## Cross-chain proposals

Historical MetaMask/Phantom proposals assume automatic DeSo-wallet mapping through third-party swap infrastructure. That is not an established VIA contract. SIWE/Solana sign-in, account linking, custody, recovery, chain fees and privacy implications must be separately designed before any cross-chain login is active.

## Gasless/social-login proposals

Google/e-mail onboarding and transaction sponsorship remain Phase 3 concepts. VIA must not claim a generated wallet is non-custodial, gasless, or automatically mapped to DeSo until the exact provider, key custody, recovery flow, sponsorship limits and failure model are verified.

## Claims discipline

Origin-bound passkeys reduce phishing risk but do not make phishing or account takeover impossible. Do not publish claims such as `100% phishing-proof`, `accounts can never be hijacked`, or `silent signing is safe`.

## Phase 3 / decision required

- choose the authoritative VIA account/session model;
- determine whether passkeys are authentication-only or also used to approve sensitive operations;
- define DeSo account linking and proof-of-control flow;
- define bounded transaction permissions and revocation/recovery;
- decide whether Google/e-mail login requires an external identity provider and what data it stores;
- decide whether cross-chain login is needed at all;
- verify any transaction-sponsorship model and cost ceiling before exposing it in UI.
