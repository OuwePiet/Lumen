# VIA document consolidation audit

## Rule

VIA and viadeso.online are the canonical product and domain. Lumen and VERO are historical project names. Historical documents remain source material until their useful content is incorporated or a reasoned Phase 3 decision records why it is not adopted.

## Canonical foundation — preserve and implement

The original Phase 1 foundation remains the baseline where it agrees with the live VIA architecture. Preserve and progressively implement the useful DeSo-native capabilities: public profiles, posts and feeds, creator discovery, NFT ownership and marketplace data, wallet balance display without custody, messaging subject to a separate privacy/security design, international language/time support, and DeSo as the source of truth for blockchain ownership.

## Consolidate — same product idea, old implementation/name

The Lumen/VERO master, implementation and developer documents repeatedly describe the same product areas under different names and stacks. Their product ideas are inputs to VIA; their old branding and conflicting Webflow/Framer/no-code architecture are not authoritative over the current Next.js/Vercel VIA build.

Examples to consolidate rather than duplicate:

- Lumen / VERO naming -> VIA.
- Multiple login-menu documents -> one VIA identity/onboarding architecture.
- Multiple update/detection documents -> one controlled compatibility/update system.
- Multiple NFT plans -> one DeSo-native NFT engine and gallery architecture.
- Multiple security documents -> one VIA trust/security model.
- Multiple admin descriptions -> one permissioned VIA admin design.
- Multiple international additions -> one localization/international roadmap.

## Phase 2 — adopt after verified design

These are valuable expansion areas, but require current API/security/payment verification before production activation:

- DeSo Identity and minimally scoped Derived Keys for intentional on-chain actions.
- Mint, bid, sale, transfer, burn and other supported NFT transactions.
- Social write actions such as posts, comments, follows, reposts and diamonds where currently supported by DeSo.
- App/User Associations and metadata where the deployed DeSo contract supports the intended behavior.
- Premium media/storage and payment integrations.
- Auctions, bulk minting and creator monetization.
- Verification/admin workflows with explicit evidence and liability boundaries.
- Node resilience/failover using only verified compatible endpoints/nodes.
- International payment/localization extensions after provider capability verification.

## Phase 3 — do not implement as written

### Server-side seed phrase / central signing wallet
Historical wallet and sponsored-transaction proposals place a platform seed phrase in backend environment variables and use it for signing. VIA must not request, store, log, transport or centrally use a user's seed/private key. Any future transaction authority must follow the VIA trust model and use deliberately scoped/revocable permissions where supported.

### Silent derived-key transactions
Historical test material expects bids to execute silently after a temporary Derived Key is stored in session storage. This is not accepted as a production security requirement. Transaction permissions, storage, expiry, revocation and user intent must be explicitly designed and verified first.

### Automatic implementation of detected third-party software
Historical VERO detection documents claim new external software can be detected on-chain and automatically implemented in the interface. VIA may detect/observe compatible metadata, but untrusted third-party payloads must never become executable functionality merely because they appear on-chain. Required model: detect -> validate/allowlist -> safely render or deliberately enable.

### Unverified node rotation
Historical documents list third-party sites as interchangeable DeSo API nodes. Do not fail over to a host until endpoint compatibility, trust, CORS, data integrity and operational behavior are verified. A failed primary node must not silently weaken VIA's trust boundary.

### Undocumented NFT pagination
The historical gallery assumed LastKeyHex/Limit pagination for get-nfts-for-user. Those fields are not part of the verified request contract currently used by VIA. Keep the idea recorded, but do not depend on it until the deployed API contract is verified.

## Deletion policy

Do not delete historical source documents merely because their names or implementation details are obsolete. First classify each relevant idea as incorporated, superseded/merged, or Phase 3. Once the useful information is represented in canonical VIA documentation and code, duplicate historical material may be archived; destructive deletion requires an explicit cleanup decision.
