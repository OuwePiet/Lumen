# VIA Storage Service Product

viadeso.online remains the active VIA baseline. This document defines the still-open external storage/service layer without reopening already-approved VIA UI or wallet decisions.

## Product principle

VIA is an international meeting place, not a storage shop or a transaction machine. Storage is one supporting service for creators, artists, photographers, musicians, museums, archives, galleries, communities and other digital collections. It should be calm, understandable, reliable and cost-covering, with modest and transparent VIA charges where a real service is delivered.

The commercial VIA Storage Service is separate from ordinary NFT mint media.

A customer should always be able to see:

- what is being stored;
- whether the result is public, private, unlockable or only a working copy;
- which storage class is being used;
- the estimated storage/provider cost before confirmation;
- any VIA service charge as a separate line;
- whether storage is required for the selected action;
- what happens if upload, pinning, replication or verification fails.

No provider may be described as permanent, free forever or failure-proof unless that claim is independently verifiable at the moment it is shown.

## NFT mint media is a separate path

Ordinary NFT creation must not require the creator to buy VIA external storage.

The mint-media design keeps three distinct choices, subject to current provider/API verification:

- `DeSo` — use the supported DeSo media route within its current file/type limits. The working product rule is a 10 MB ceiling; VIA must validate the actual current API limit before production and fail clearly rather than silently changing storage class.
- `IPFS` — suitable when the creator deliberately chooses distributed/external media storage, including larger media that does not fit the DeSo route. VIA may later offer a paid managed IPFS option, but the cost and provider must be shown before purchase.
- `Link` — use a creator-controlled or other valid external media URL. VIA validates the reference but does not claim ownership, permanence or availability of third-party storage.

The NFT/post and its media are not to be described as identical storage objects. VIA must distinguish on-chain DeSo state from the media reference and the system that actually serves the media.

A creator may use their own compatible storage. VIA must not force a paid VIA storage purchase merely because external media is used.

## External VIA Storage Service

The separate commercial service should develop into a broad storage product rather than a single opaque upload button. It can serve material beyond NFTs: museum and heritage collections, music, photography, art masters, documents, video, archives and other digital collections.

### 1. Public Media Storage

For media that a creator or organisation deliberately asks VIA to store or manage.

Required behavior:

- validate file type, size and integrity before upload;
- show the resulting media reference where technically possible;
- verify that stored media can actually be retrieved;
- keep storage/payment separate from blockchain signing;
- never trigger or retry a blockchain transaction merely because storage returned an uncertain state.

### 2. Unlockable Content

For buyer/owner-only material.

This must not be treated as ordinary public media. The storage, access-control and encryption design must be reviewed separately before being called secure or owner-only.

Until that architecture is proven, VIA may expose the product concept but must not make a false confidentiality promise.

### 3. Media Repair / Migration

For older NFTs or collections whose external media source has disappeared or become unreliable.

The service should:

- preserve the original on-chain NFT identity where applicable;
- clearly distinguish original metadata from VIA-assisted replacement media;
- never imply that VIA can rewrite immutable historical blockchain data when it cannot;
- record the replacement reference and reason transparently;
- require creator/authorized-owner review before publishing a replacement path.

### 4. Working Storage / Creator Vault

A future private workspace for drafts, masters, certificates, backups and unreleased media is a separate product from public NFT storage.

It requires a verified private-storage architecture, access control, encryption, recovery, deletion rules, malware/integrity checks and audit behavior.

## Cost model

The aim is cost-covering and sustainable, not aggressive monetisation.

At checkout/review VIA should separate:

1. external storage/provider cost;
2. network/blockchain cost if applicable;
3. modest VIA storage/service fee if VIA charges one;
4. taxes/payment-provider costs if they apply;
5. total due.

No bundled hidden margin, no preselected paid extras and no forced VIA storage when the creator has a valid own-storage option.

Historical VIA storage tiers and prices are inventory only. They must be recalculated against current provider costs, payment costs, retention/replication requirements and a reasonable VIA service margin before publication.

## Payment direction

The external storage service needs its own reviewed checkout path. The target is a clear base price (for example EUR/USD), an up-to-date conversion quote where DESO or another supported asset is offered, an external payment reference/idempotency key, a clear payment status and a deliberate association with the customer's VIA/DeSo account.

Fiat payment confirmation, wallet/account association, conversion quotation and blockchain signing are separate security boundaries. VIA must not introduce an automatic custodial hot-wallet flow merely to make checkout appear simpler.

Regional payment methods may be added only after current provider availability, fees, legal requirements and failure/refund behavior are verified.

## Provider independence

The product contract must not be named after one storage vendor.

VIA should expose a provider-neutral storage interface internally so that a compatible provider can be replaced without redesigning the customer flow. Any concrete provider must be checked for current API compatibility, retention/pinning model, pricing, limits, deletion behavior, public gateway behavior, legal terms and failure semantics before production use.

VIA should not introduce its own always-on storage server or DeSo node merely to imitate another service. External infrastructure is acceptable when it is transparent, economical and replaceable.

## External buttons

The eventual customer-facing controls can be organised as:

- `Store media`
- `Add unlockable content` — only when the secure owner-access architecture is ready
- `Repair / migrate media`
- `Open storage details`

The button label must describe the user action, not the vendor. Provider details belong in the storage details/review screen.

For every paid or irreversible action VIA must show a review step before execution.

## Storage status model

Recommended neutral states:

- Preparing
- Validating
- Uploading
- Verifying
- Ready
- Action required
- Failed

`Ready` means VIA has verified the returned storage reference can be retrieved according to the chosen service contract. It does not mean permanent availability is guaranteed.

## Mint boundary

Minting remains a separate, explicit blockchain action. There are two legitimate cases:

### Ordinary mint media

1. creator chooses `DeSo`, `IPFS` or `Link`;
2. VIA validates that selected route and its current limits;
3. media/reference is prepared and verified;
4. VIA shows the mint review;
5. creator separately confirms/signs the DeSo publication/mint action;
6. VIA verifies the resulting on-chain state.

No VIA Storage Service purchase is required unless the creator explicitly chooses a VIA-managed paid storage option.

### Separate VIA Storage Service

1. customer chooses a storage service/tier;
2. VIA validates files and shows provider cost, VIA fee and total;
3. customer confirms and pays;
4. VIA stores and verifies the media;
5. the resulting reference can later be used for an NFT, gallery, museum/archive collection, music, photography or another supported VIA module.

A storage failure must not create a blockchain transaction. A blockchain failure must not automatically create duplicate storage purchases or uploads.

## International product direction

VIA should evaluate storage as infrastructure for the whole international platform, not only for NFT images. Future modules may have different storage and delivery requirements for museums/heritage, music/audio, photography, video, art collections, documents and community material.

The common rules remain: simple access, user choice, transparent cost, no unnecessary custody, no hidden lock-in, no exaggerated guarantees and no assumption that every visitor must be a buyer or seller.

## What is deliberately not decided yet

The following require a separate implementation decision before production:

- exact external storage provider(s);
- recalculated storage tiers, exact pricing and VIA service fee;
- retention/pinning duration or replication level;
- private/unlockable encryption and key ownership;
- whether VIA offers paid redundancy across providers;
- legal/tax treatment of a paid storage service;
- exact external payment provider(s) and regional methods;
- repair/migration authority rules for non-creators/current owners;
- deletion rights where blockchain metadata already references the media;
- SLA/availability wording.

## Acceptance criteria before the external storage service goes live

- provider and API verified against current documentation;
- no provider secret exposed to the browser;
- upload limits and supported media documented;
- cost quote shown before confirmation;
- failure/timeout/duplicate handling tested;
- stored reference retrieval verified;
- no claim of permanence or unlimited free storage;
- no private-media claim without proven access-control architecture;
- NFT mint remains separately confirmed and signed;
- ordinary mint does not force purchase of VIA external storage;
- customer can see exactly which service was purchased and what it covers.
