# VIA checkout order validation

The order boundary validates the minimum commercial and identity fields before any future payment attempt.

A successful validation does **not** confirm payment, ownership, delivery, or a blockchain transaction.

## Required

- `orderId`
- `nftId`
- `sellerPublicKey`
- positive safe-integer `amountMinor`
- supported currency: EUR, USD, BTC, or DESO

`buyerPublicKey` is optional at this stage but, when supplied, must be non-empty.
