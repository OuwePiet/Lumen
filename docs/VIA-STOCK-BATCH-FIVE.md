# VIA Stock Batch Five — Login, security and admin

This batch compares the historical login/security/admin documents against the current VIA baseline. viadeso.online remains authoritative.

## Adopted as product principles

- **Simple onboarding:** VIA should minimize login friction and avoid asking users to handle a 24-word seed inside VIA.
- **Passkey-ready UX:** Face ID / Touch ID / passkeys are a useful future authentication direction, but only after the exact VIA account-control model is verified and designed.
- **Explicit authority boundaries:** login convenience must never be treated as permission to sign blockchain actions silently.
- **Protected admin role:** any future admin area must require an authenticated session plus authoritative proof of account/wallet control; a public-key string alone is insufficient.
- **Least privilege:** if VIA later adds a database-backed account layer, users may edit only their own allowed fields and privileged flags must be server-controlled.
- **Developer/test access:** VIA may support a clearly defined owner/developer test role so platform testing does not create artificial fees. This must be explicit role logic, not a hidden client-side payment bypass.

## Not implemented yet

### Passkeys / WebAuthn
Useful direction, but the historical documents overstate guarantees such as “100% safe” and “impossible to phish” and assume a specific derived-key coupling that VIA has not verified. No passkey authentication code is added in this batch.

### Silent Derived Keys
Rejected as proposed. VIA will not persist derived private keys in `sessionStorage` or `localStorage`, and it will not silently sign on-chain actions in the background.

### Cross-chain wallet login
MetaMask/Phantom onboarding, SIWE/SIWS and automatic mapping to DeSo accounts remain deferred. They add cross-chain identity and account-linking trust assumptions outside the current VIA core.

### Gasless sponsored transactions
Deferred. Sponsorship may be useful later, but requires a narrowly scoped signing, rate-limit, abuse-prevention and recovery design. No platform seed or generic relay is introduced.

### Supabase as mandatory platform database
Not adopted as a default architecture. The historical SQL/RLS examples contain useful least-privilege ideas, but VIA currently prefers DeSo as the authoritative source where possible and does not add an off-chain database solely because an old blueprint proposed one.

### Verification flags and admin badges
Deferred until VIA has explicit criteria and authoritative sources. No client or database flag may create a public trust badge by itself.

### Owner payment bypass
The requirement that the owner can test VIA without charging himself is valid, but the historical implementation is not adopted. A future developer/test entitlement must be server-authoritative, auditable and separated from real purchase records.

## Documents reviewed

- `Google-aanvulling inlogmenu.docx`
- `Google-inlogmenu-code.docx`
- `Google-inlog ouwepiet gratis.docx`
- related security/admin material already represented in Phase 3

## Result

No blockchain signing or authentication implementation is changed in this batch. The useful UX/security principles are retained; unverified or high-risk mechanisms are explicitly deferred rather than silently discarded.
