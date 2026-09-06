# VIA public data trust model

VIA treats URL parameters as navigation hints, never as authoritative identity data.

## Rules

- A DeSo username/public-key relationship must be resolved from DeSo before VIA presents it as an account relationship.
- Public blockchain/profile data is read-only until an authenticated transaction flow is deliberately introduced.
- VIA must not label an account, creator, NFT, payment, or ownership state as verified unless the displayed claim is actually checked against its authoritative source.
- Private keys and seed phrases are never requested, stored, logged, or transported by VIA.
- Future Derived Key permissions must be minimal, explicit, revocable, and limited to the required transaction types.

These rules are release constraints for VIA / viadeso.online.