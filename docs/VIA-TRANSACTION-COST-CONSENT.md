# VIA automatic transaction cost and consent rule

Status: mandatory safety and payment boundary for future write actions.

## Purpose
A low or volatile DESO market price must not make VIA's costs unpredictable or leave creator actions unable to pay required blockchain/provider costs. VIA therefore does not use a permanent fixed DESO amount for minting or other write actions.

## DeSo facts used by this rule
DeSo transaction construction responses expose `FeeNanos`. NFT and other construction endpoints accept `MinFeeRateNanosPerKB`, and many accept optional `TransactionFees` outputs. Constructed transactions still require explicit signing and broadcast before they take effect.

VIA treats the prepared transaction as the source for the transaction-specific blockchain fee. It does not assume yesterday's fee or infer a network fee solely from the DESO market price.

## Mandatory flow for paid/write actions
For Mint and, later, Sale, Transfer, Burn and other DeSo write actions:
1. Prepare/construct the intended transaction without broadcasting it.
2. Read the transaction-specific `FeeNanos` and all other DESO spend/outputs from the prepared transaction.
3. Obtain a current verified DESO fiat rate when a EUR/USD equivalent is shown or when a VIA fiat-denominated charge is paid in DESO.
4. Add any separately applicable VIA storage/service amount and provider/payment costs under the existing customer-payment rules.
5. Check that the signing account has enough spendable DESO for the blockchain transaction and any DESO-denominated approved outputs.
6. Show the creator the costs before signing.
7. Require explicit creator approval for the displayed transaction/cost boundary.
8. If the quote, prepared transaction, relevant fee inputs or exchange rate become stale or materially change before signing, invalidate the approval and recalculate/reconfirm.
9. Only after valid approval hand the prepared transaction to an approved signing route.
10. Broadcast and then verify the expected result on DeSo before VIA reports success.

## Creator consent
The confirmation must be understandable and specific. It should show, when applicable:
- VIA storage/service customer price.
- DeSo network fee in DESO.
- Current EUR/USD equivalent as an informational conversion when a verified rate is available.
- Any additional transaction output that the creator is actually authorizing.
- Expected total creator outlay where it can be calculated accurately.

Consent must be affirmative. Opening the mint page, uploading a file or logging in is not consent to pay. A generic old acceptance cannot authorize an unknown future amount.

## Insufficient balance
VIA must not intentionally submit a transaction when its preflight check shows insufficient DESO. The creator receives a clear minimum/shortfall message and can retry after funding the signing account. The balance check is preflight protection, not a guarantee that network state cannot change before broadcast.

## DESO price volatility
- Blockchain fee is determined in DESO/nanos from the actual transaction/network mechanism, not increased merely because the DESO fiat price falls.
- VIA/provider/storage costs that are economically denominated in EUR/USD remain fiat-based.
- If a customer elects to pay an eligible VIA fiat-denominated charge in DESO, calculate the DESO amount from a fresh verified rate with a short quote lifetime.
- An expired/stale/unavailable rate cannot silently become a guessed rate.
- VIA must not structurally subsidize provider/storage/payment costs because DESO moved between screens.

## TransactionFees boundary
DeSo documents `TransactionFees` as additional outputs on many transaction construction endpoints. VIA must not use this mechanism as a hidden service charge. Any VIA use requires separate technical verification, explicit amount/recipient disclosure, creator consent, accounting treatment and confirmation that it fits the intended DeSo API behavior. Until then, VIA service/storage settlement remains separate from the blockchain network fee.

## Signing boundary
Approval of costs is not the signature itself. The creator still signs using a verified supported signing route. VIA does not ask for a seed/recovery phrase and does not silently sign on the creator's behalf.

## Failure and recovery
Payment success, storage success, transaction construction, signing, broadcast and on-chain confirmation are separate states. VIA must record enough non-secret state to recover safely and must not charge or submit twice on a retry. Exact refund/recovery policy remains a separate implementation decision before paid mint goes live.

## UI state model
Future implementation should distinguish at least:
`calculating` -> `ready_for_consent` -> `approved` -> `signing` -> `broadcasting` -> `verifying` -> `confirmed`

Failure states include `rate_unavailable`, `fee_unavailable`, `insufficient_balance`, `quote_expired`, `signature_cancelled`, `broadcast_failed`, and `verification_failed`.

No state may skip from upload/details directly to confirmed without the required cost preparation, creator consent, signing and on-chain verification.
