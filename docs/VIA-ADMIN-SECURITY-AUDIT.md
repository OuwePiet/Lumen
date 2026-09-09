# VIA Admin & Security Audit

viadeso.online remains the active VIA baseline. This note reviews historical admin/security proposals as idea stock, not as executable production instructions.

## Retain

- Administrative capabilities must be separated from ordinary visitor and creator capabilities.
- Secrets that VIA genuinely needs must never be committed to the repository or exposed to browser code.
- If VIA later introduces a database, authorization must be enforced server-side/data-side; UI hiding alone is not authorization.
- HTTPS is required for VIA traffic and external endpoints should be treated as untrusted until validated.
- Sensitive administrative actions need explicit authorization, auditability, bounded permissions and clear failure states.
- Moderation/admin roles must not automatically gain wallet signing, unlockable-content or asset-control authority.

## Reject as an authorization mechanism

Historical documents propose loading an admin panel when the currently visible DeSo public key equals the owner's public key. A public key is an identifier, not proof that the visitor controls that wallet. VIA must not grant admin rights from a client-side public-key comparison.

Any future owner/admin session must rely on verified authentication plus server-authoritative authorization. Wallet-control proof, when relevant, must be explicit and cryptographically verified; it must not be inferred from a typed username/public key or public profile state.

## Do not store derived secrets

Historical security text proposes encrypting Derived Seeds/keys in a database with an environment encryption key. This is not part of the current VIA baseline and must not be introduced as a shortcut. VIA should avoid receiving or persistently storing seed phrases, private keys or derived private-key material wherever possible.

An environment variable can protect a server secret from being committed to source control, but it does not make a database or architecture automatically secure and is not a basis for absolute security claims.

## Conditional future database controls

Row Level Security can be useful if a future VIA feature genuinely requires Supabase or another database. It is not currently assumed as VIA infrastructure. If introduced, policies must be designed and tested against the actual identity/session model rather than merely switched on.

Likewise, verification flags, blacklists, fee waivers, ranking tables and automatic pricing engines require documented authority, criteria, appeals/recovery where relevant, data provenance and audit behavior before becoming public trust signals or financial controls.

## Phase 3 / decision required

- exact owner/admin authentication architecture;
- whether VIA needs a private application database at all for each proposed feature;
- moderator and tester role model;
- server-side audit log and recovery model for consequential admin actions;
- any wallet-signature proof used to bind a DeSo identity to an authenticated VIA account;
- pricing/fee administration and exchange-rate source/failure rules;
- verification/badge authority and revocation policy.

## Claims discipline

Do not describe VIA as hack-proof, hermetically secured, 100% protected, or automatically safe because one control such as RLS, HTTPS or an environment variable is present. Security is layered and must be verified against the deployed architecture.
