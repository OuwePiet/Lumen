# VIA Phase 3 — Not adopted / discuss

This file records relevant ideas that are deliberately not adopted into the active VIA build yet. Nothing is silently discarded.

## Verification labels

- **Idea:** Automatically show a `DeSo verified` badge on every NFT card.
- **Source:** Existing VIA/Lumen implementation and earlier blueprint discussions around verification badges.
- **Why not adopted as-is:** The current card code does not verify an authoritative DeSo verification field before rendering the badge. Showing the badge for every creator would create a false trust signal.
- **Current decision:** Replace the unconditional label with the factual `On-chain NFT` label. A real verification badge can return only after VIA has a reliable verification source and explicit mapping rules.
- **Discussion status:** Open for later review.

## Undocumented NFT cursor pagination

- **Idea:** Page through `get-nfts-for-user` with `LastKeyHex` and `Limit` and merge the returned pages client-side.
- **Source:** Legacy VIA/Lumen public collection loader.
- **Why not adopted as-is:** The DeSo endpoint contract currently used by VIA documents the user key, reader key and optional sale/pending filters, but VIA has not verified `LastKeyHex`, `Limit`, or a returned NFT cursor as part of that contract.
- **Technical risk:** Depending on unverified cursor fields can create false completeness assumptions for large collections and makes the gallery harder to reason about.
- **Current decision:** Keep the central request guard that strips unverified request fields and move the gallery toward the documented `getNFTsForUser` loader. Do not claim server-side pagination until the deployed DeSo contract is verified.
- **Alternative:** Retain VIA's client-side 25-item presentation paging after one authoritative collection load; revisit transport pagination if DeSo documents or verifies a cursor contract.
- **Discussion status:** Recorded for later review; no NFT functionality is intentionally discarded.
