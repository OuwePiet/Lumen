# VIA NFT claim — verifiable sources and trust boundaries

Status: implementation audit, **not** a working claim endpoint.

## Chain-backed evidence
- Like: DeSo `get-likes-for-post`, paginated; match the claimant public key, never rely on count.
- Follow: DeSo `get-follows-stateless`; match claimant and creator public keys. Audit response shape and pagination before enforcement.
- Diamonds: DeSo `get-diamonds-for-post`, paginated; match sender public key and verify the **level for the specified post**. A post's aggregate diamond count is insufficient.
- NFT editions: DeSo `get-nft-entries-for-nft-post`; verify the exact serial, current owner, pending status and availability again before signing/transfer.
- Transfer result: use the submitted DeSo transaction hash and re-read ownership; never treat a client-side success toast as proof.

Official docs:
- https://docs.deso.org/deso-backend/api/post-endpoints
- https://docs.deso.org/deso-backend/api/nft-endpoints
- https://docs.deso.org/deso-blockchain/on-chain-data

## Not automatically on chain
NFTz-specific claim rules, per-account redemption limits, reserved inventory, off-chain payments, and provider-side eligibility are **not** established as native DeSo consensus rules. Record the exact policy source, version/hash and creator identity; never label an unverified provider assertion 'on-chain'.

## Safety gates
- Unknown/error/unavailable is not verified; no automatic retry that spends diamonds.
- A valid social proof does not reserve an edition; recheck chain ownership and serial at execution.
- Never promise atomic conditional claim transfer without an audited protocol or escrow mechanism.
- Existing `lib/via/giveaway-policy.ts` includes `via-key`, `via-points`, and external payment conditions; these cannot be described as independently chain-verifiable without separate evidence.
- Do not modify DeSo Identity while its separate work is in progress.
- Do not rely on SafetyNet, Carry2Web or NFTz hosted indexes as the only source of truth.

## Before implementing
1. Verify actual response schemas and pagination against a live DeSo node with test identities.
2. Decide where a signed, immutable claim policy is published and how VIA reads it.
3. Design issuance and anti-double-claim safeguards, including concurrency and owner signing.
4. Test an actual NFT transfer on a non-production account, including failed/stale proofs.
