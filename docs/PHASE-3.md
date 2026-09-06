# VIA Phase 3 — Not adopted / discuss

This file records relevant ideas that are deliberately not adopted into the active VIA build yet. Nothing is silently discarded.

## Verification labels

- **Idea:** Automatically show a `DeSo verified` badge on every NFT card.
- **Source:** Existing VIA/Lumen implementation and earlier blueprint discussions around verification badges.
- **Why not adopted as-is:** The current card code does not verify an authoritative DeSo verification field before rendering the badge. Showing the badge for every creator would create a false trust signal.
- **Current decision:** Replace the unconditional label with the factual `On-chain NFT` label. A real verification badge can return only after VIA has a reliable verification source and explicit mapping rules.
- **Discussion status:** Open for later review.
