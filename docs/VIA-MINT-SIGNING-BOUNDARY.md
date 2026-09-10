# VIA mint signing and fee boundary

Status: implementation guidance.

## Purpose

Keep VIA minting simple for creators while preserving the security boundary between VIA, DeSo Identity and any future externally controlled signer.

## Default creator flow

1. Creator selects media.
2. VIA validates media and selects the normal compatible storage route automatically.
3. Advanced storage options may expose DeSo, managed IPFS/VIA storage or a creator-controlled link where compatible.
4. If the selected route creates a paid VIA storage obligation, VIA shows the final creator/customer storage price before activation and requires confirmed payment.
5. Creator completes NFT metadata, copies/supply, royalties and sale settings that are supported.
6. VIA presents a final mint review.
7. VIA constructs the required unsigned DeSo transaction(s).
8. The authorized signer signs outside VIA's custody boundary.
9. VIA submits the signed transaction and verifies the resulting on-chain state before showing success.

## DeSo transaction boundary

Official DeSo documentation describes the transaction lifecycle as construct -> sign -> broadcast. The create-nft endpoint constructs a Create NFT transaction; it must be signed and submitted before the NFT change takes effect.

VIA may construct an unsigned transaction using the creator public key and current transaction parameters. VIA must not claim mint success merely because construction succeeded.

The final review must distinguish:

- VIA storage/service customer price, when applicable;
- blockchain/network transaction fee information derived from the transaction construction response or other verified DeSo transaction data;
- any optional app-level transaction fee, if VIA ever deliberately enables one;
- the resulting estimated/confirmed total without disguising one category as another.

Network fees must not be hard-coded as a permanent mint price. They are transaction-dependent and should be refreshed near signing.

## Signing modes

### DeSo Identity / approved VIA account flow

DeSo Identity remains the documented signing path. DeSo supports owner/public-key signing through Identity and derived keys with transaction spending limits. VIA should request only the permissions actually needed. Primary private keys must never be requested, stored or logged by VIA.

### External signer / hardware wallet

Keep an external-signer option in the architecture, but do not advertise a named hardware wallet such as Ledger as supported until an end-to-end DeSo-compatible signing path has been verified in current production documentation and tested by VIA.

A future external signer must receive only the transaction material needed for review/signing, return a valid signature/signed transaction, and leave the private key/seed on the external device or wallet. VIA then broadcasts and verifies the result.

If a signer cannot display or verify the relevant DeSo transaction details safely, it must not be enabled merely because it can produce a cryptographic signature.

## UX rule

Normal creators should see a short flow: Upload -> Details -> Costs -> Review -> Sign -> Minted.

Technical storage and signer choices belong under advanced options unless action is required. Before the final signature, the creator must be able to see the applicable VIA storage/service amount and the current blockchain transaction fee information separately.

## Security exclusions

This document does not authorize:

- storing owner seeds/private keys in VIA;
- browser localStorage of sensitive signing material;
- server-side owner-key custody;
- silent unrestricted derived-key permissions;
- automatic wallet sweeps;
- supplier-payment automation;
- claiming Ledger or another named hardware wallet is supported without verified integration;
- hard-coded network fees.

## Implementation order

1. Keep current VIA read-only/public functionality intact.
2. Build a mint review model that can display storage/service price and transaction fee separately.
3. Verify the current DeSo create-post/create-nft construction responses and fee fields against production.
4. Integrate DeSo Identity with minimum required NFT/post permissions and explicit signing confirmation.
5. Test construct -> sign -> submit -> on-chain verification on a controlled account/test environment.
6. Only then investigate and certify specific external/hardware signers.
