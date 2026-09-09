# VIA Storage Service Product

viadeso.online remains the active VIA baseline. This document defines the still-open storage/service layer without reopening already-approved VIA UI or wallet decisions.

## Product principle

Storage is a separate service decision, not a hidden side effect of minting.

A creator should always be able to see:

- what is being stored;
- whether the result is public, private, unlockable or only a working copy;
- which storage class is being used;
- the estimated storage/provider cost before confirmation;
- any VIA service charge as a separate line;
- whether storage is required for the selected action;
- what happens if upload, pinning, replication or verification fails.

No provider may be described as permanent, free forever or failure-proof unless that claim is independently verifiable at the moment it is shown.

## Creator-facing service choices

The external storage action should develop into a small service selector rather than a single opaque upload button.

### 1. Public NFT Media

For media that is intended to be referenced publicly by a DeSo post or NFT.

Required behavior:

- validate file type, size and integrity before upload;
- show the final public media reference before mint confirmation where technically possible;
- verify that the stored media can actually be retrieved before the mint step continues;
- keep the media/upload step separate from the blockchain-signing step;
- never retry a blockchain mint merely because the storage provider returned an uncertain state.

### 2. Unlockable Content

For buyer/owner-only material.

This must not be treated as ordinary public media. The storage, access-control and encryption design must be reviewed separately before being called secure or owner-only.

Until that architecture is proven, VIA may expose the product concept but must not make a false confidentiality promise.

### 3. Media Repair / Migration

For older NFTs whose external media source has disappeared or become unreliable.

The service should:

- preserve the original on-chain NFT identity;
- clearly distinguish original metadata from VIA-assisted replacement media;
- never imply that VIA can rewrite immutable historical blockchain data when it cannot;
- record the replacement reference and reason transparently;
- require creator/authorized-owner review before publishing a replacement path.

This service is especially relevant for legacy NFT media whose original hosting is no longer dependable.

### 4. Working Storage / Creator Vault

A future private workspace for drafts, masters, certificates, backups and unreleased media is a separate product from public NFT storage.

It requires a verified private-storage architecture, access control, encryption, recovery, deletion rules, malware/integrity checks and audit behavior. It is not part of the first public-media button merely because historical documents described a Vault.

## Cost model

Storage costs belong to the creator at the moment the creator requests the service, unless a future commercial flow explicitly says otherwise.

At checkout/review VIA should separate:

1. external storage/provider cost;
2. network/blockchain cost if applicable;
3. VIA storage/service fee if VIA charges one;
4. taxes/payment-provider costs if they ever apply;
5. total due.

No bundled hidden margin and no preselected paid extras.

A later resale may economically compensate a creator for earlier costs, but that must never be presented as an automatic guaranteed reimbursement unless the sale contract actually provides it.

## Provider independence

The product contract must not be named after one storage vendor.

VIA should expose a provider-neutral storage interface internally so that a compatible provider can be replaced without redesigning the creator flow. Any concrete provider must be checked for current API compatibility, retention/pinning model, pricing, limits, deletion behavior, public gateway behavior, legal terms and failure semantics before production use.

The first implementation should prefer the smallest architecture that satisfies the actual VIA requirement. VIA should not introduce its own always-on storage server merely to imitate an old document.

## External buttons

The eventual creator-facing controls can be organised as:

- `Store public media`
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

For public media, `Ready` means VIA has verified the returned storage reference can be retrieved according to the chosen service contract. It does not mean permanent availability is guaranteed.

## Mint boundary

Minting remains a separate, explicit blockchain action.

The preferred order is:

1. creator selects media and storage service;
2. VIA validates file and shows costs;
3. creator confirms storage service;
4. VIA stores and verifies media;
5. VIA shows the final media reference and mint review;
6. creator separately confirms/signs the DeSo publication/mint action;
7. VIA verifies the resulting on-chain state.

A storage failure must stop before mint. A mint failure must not automatically create duplicate storage purchases or duplicate uploads.

## What is deliberately not decided yet

The following require a separate implementation decision before production:

- exact external storage provider(s);
- exact pricing and VIA service fee;
- retention/pinning duration or replication level;
- private/unlockable encryption and key ownership;
- whether VIA offers paid redundancy across providers;
- legal/tax treatment of a paid storage service;
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
- mint remains separately confirmed and signed;
- creator can see exactly which service was purchased and what it covers.
