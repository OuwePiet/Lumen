# VIA Creator Costs Audit

Source reviewed: historical `Google kosten overzicht-creator.docx`. VIA / viadeso.online remains the active baseline. Historical prices, providers and guarantees are treated as proposals, not current product truth.

## Retain now as product principles

- Creator-facing costs must be transparent: show what a fee is for before the user commits.
- Avoid subscription pressure where a pay-per-feature model is sufficient and understandable.
- Separate DeSo/network costs from VIA service costs and from third-party storage/payment costs.
- Any displayed price must clearly identify its currency, what it covers, and whether it is an estimate or a fixed VIA charge.
- Pricing copy must avoid absolute claims such as `free`, `guaranteed`, `permanent`, `unbreakable`, or guaranteed long-term storage unless VIA has an authoritative basis for that exact claim.
- Do not hard-code external-provider assumptions into the public product contract. External provider pricing and availability can change.
- Creator cost information should ultimately be available in one clear VIA transparency surface rather than scattered across mint, upload and sales flows.

## Candidate for later implementation

A dedicated VIA transparency/pricing surface is useful once real payable modules exist. It should be driven by a verified configuration/source-of-truth so the price shown in the UI matches the amount charged at checkout or on-chain.

Useful future fields include:

- VIA service fee;
- DeSo/network fee or estimate;
- media/storage cost;
- payment processor cost where applicable;
- creator royalty;
- holder/secondary royalty where applicable;
- buyer total;
- creator net proceeds.

If exchange-rate conversions are shown, the underlying rate source, timestamp and rounding rule must be explicit. A stale or unavailable rate must never silently become a transaction price.

## Deferred / Phase 3

The following historical proposals are not active VIA commitments and must remain deferred until their technical, legal and financial assumptions are verified:

- fixed historical euro prices for premium video, bulk minting or advanced auctions;
- payment by a fixed number of Diamonds derived from an assumed conversion;
- automatic highest-bid acceptance driven by backend timers;
- a privileged Top 10 fee waiver tied to an unverified ranking model;
- Stripe, Gumroad, Cloudflare or any other specific provider as a mandatory VIA dependency;
- automatic hourly cryptocurrency repricing used directly for payable transactions without stale-rate, outage, rounding, slippage and consent handling;
- claims that any fee model makes VIA financially indestructible or guarantees NFT/media safety for decades;
- any admin price-control mechanism that can alter payable amounts without authorization, audit trail and consistency checks between displayed and charged price.

## Release rule

No creator charge should go live until VIA can verify all of the following for that module:

1. the actual cost source and pricing authority;
2. the exact amount/currency presented before confirmation;
3. what is paid to DeSo/network, VIA and any external provider;
4. failure/refund/retry behavior;
5. wallet/payment authorization and user consent;
6. an audit trail sufficient to explain the final charged amount.

Until those conditions are met, VIA may explain cost principles but must not present historical example tariffs as live prices.
