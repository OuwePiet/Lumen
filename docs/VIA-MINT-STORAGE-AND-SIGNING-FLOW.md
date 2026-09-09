# VIA mint storage and signing flow

Status: implementation boundary. The current VIA implementation remains authoritative.

## Goal
Minting must feel simple to a creator while VIA keeps storage, payment and signing responsibilities explicit and safe.

## Default creator flow
1. Upload/select media.
2. VIA validates media type and size and recommends a suitable public-media route.
3. Creator may open Advanced storage options when they want to choose another compatible route.
4. Creator completes NFT fields, copies/supply, royalties and unlockable settings where supported.
5. If paid VIA-managed storage is required, VIA shows the final customer storage price before minting. Payment is confirmed before VIA incurs paid supplier storage for that creator.
6. VIA prepares the mint review and transaction data.
7. Review shows VIA/storage charges separately from the estimated blockchain/network transaction cost when that cost can be determined from the prepared transaction.
8. Creator signs through a verified supported signing route.
9. VIA submits or hands off the signed transaction as appropriate and verifies the result against DeSo before calling the mint successful.

## Public media routes
The simple flow should recommend rather than force technical terminology on a new creator. Advanced options may expose:
- DeSo-supported image/media route where the current API and file limits allow it.
- VIA-managed IPFS or other approved external/distributed media storage for larger or appropriate media.
- Creator-controlled compatible public URL.

Paid VIA storage is not forced when a valid creator-controlled/no-paid-VIA route is available. If VIA must purchase storage specifically for a creator's NFT/media flow, that cost belongs to that transaction under the customer-payment rule.

## Customer-owned local or external drive
A creator may keep the original/master on their own computer, external hard drive, SSD, NAS or other customer-controlled local storage. This is a backup/archive option, not by itself a public NFT media route: a local disk is normally not continuously reachable by collectors or other VIA visitors.

VIA may therefore offer the non-custodial instruction `Keep original on your own drive` alongside the public-media choice. VIA does not take custody of that drive, promise its availability, or treat possession of a local copy as proof that public NFT media remains reachable.

A large original can stay customer-controlled while a suitable public rendition is used for the NFT reference. The UI must not imply that VIA uploaded or backed up a local original unless that actually happened through a separately selected service.

## Signing routes
VIA's signing layer must be adapter-based. A route may be shown as supported only after its current DeSo transaction-signing path has been technically verified.

Candidate routes include:
- VIA's future simple supported login/signing route.
- External wallet signing.
- Hardware-wallet signing such as Ledger, only after verified DeSo compatibility.
- MetaMask, only after verified DeSo compatibility for the exact transaction/signing method VIA needs.

Naming MetaMask or Ledger here records them as candidates; it is not a production support claim.

## Security boundary
- VIA must never ask for or store a creator's 24-word seed phrase or hardware-wallet recovery phrase.
- External/hardware wallet private keys remain outside VIA.
- A public key or wallet identifier is not proof of control.
- VIA must not label a transaction minted until DeSo verification confirms the expected on-chain result.
- No automatic wallet signing, custody, DESO sweep, supplier payment or hidden derived-key behavior is authorized by this document.

## Cost presentation
The final mint review should make costs understandable without turning the normal flow into a technical dashboard:
- VIA/storage/service customer amount, if applicable.
- Estimated/current blockchain transaction cost derived from the actual prepared transaction or verified DeSo mechanism when available.
- Total expected creator outlay where the components can be combined accurately.

Do not hard-code a blockchain fee as a permanent price. If a reliable current fee cannot be determined, say so rather than inventing one.

## Implementation order
1. Keep the current read-only NFT experience stable.
2. Build media validation and recommended storage selection without wallet authority.
3. Connect the approved storage price/checkout boundary.
4. Build transaction preparation and cost preview read-only first.
5. Verify each signing adapter independently against current DeSo behavior.
6. Enable a signing route only after security, failure/retry, idempotency and on-chain verification are tested.
