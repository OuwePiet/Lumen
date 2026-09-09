# VIA Storage Price Board Audit

Status: current implementation guidance. viadeso.online remains authoritative. Historical documents are inventory and must be verified before production use.

## Source order

For storage and pricing work, use this order before changing VIA:

1. current viadeso.online implementation;
2. current VIA modules and approved repository policy;
3. historical Word/module documents;
4. fresh provider/API/pricing verification;
5. only then implement a missing or improved part.

This prevents a recent research note from replacing an earlier approved VIA decision.

## Recovered module decisions

Historical Module L.1 explicitly selected Cloudflare R2 for served images/media, including paid uploads and storage previews, and rejected Cloudflare Images as a separate product. This is a strong recovered decision, but it is not by itself permission to wire R2 into production: current API, pricing, retention, deletion, privacy and operational requirements still need fresh verification.

Historical IPFS material separately names Pinata and Web3.Storage as possible IPFS providers. They are provider candidates/routes, not proof that Pinata is the single fixed VIA storage provider.

The current VIA storage policy remains provider-neutral. Ordinary NFT media and the paid VIA Storage Service remain separate products.

## Historical price-board inventory

The historical documents contain these example one-time customer prices:

- up to 10 MB: EUR 2.90
- up to 50 MB: EUR 7.90
- up to 100 MB: EUR 14.90
- up to 500 MB: EUR 34.90
- 1 TB: EUR 149
- small archive 500 MB-5 GB: EUR 34.90-EUR 89
- museum/collection 50-500 GB: EUR 199-EUR 699
- institutional 1 TB+: from EUR 149/TB, tiered

These values are inventory, not production truth. The old documents also contain permanence and market-comparison claims that must not be repeated without evidence.

## Price board rule

The storage price board must be configuration-driven and automatically refresh when its underlying verified cost inputs change. It must show clearly:

- storage/service tier;
- customer price in the selected fiat reference currency;
- external provider/network cost where applicable;
- VIA service component where applicable;
- last-updated time;
- unavailable/stale state instead of an invented value.

DESO remains a small optional payment rail. Storage products are priced from fiat reference prices; a DESO amount is calculated only at checkout from the current verified rate and is not the storage accounting unit.

## Provider rule

Do not hard-code a provider into customer-facing product logic. Provider adapters/configuration should allow VIA to change provider without changing the storage product contract. A production provider may only be enabled after current verification of:

- official pricing and billing units;
- upload/API limits;
- retention/pinning/durability terms;
- egress/gateway costs and limits;
- deletion/export/migration rights;
- authentication and secret handling;
- outage/failure behaviour;
- privacy, region and legal implications.

## Next implementation boundary

Do not publish the historical storage prices as live prices yet. First verify the current Cloudflare R2 commercial/API facts and current viable IPFS provider facts. Then calculate sustainable VIA customer prices from actual provider cost plus a modest transparent VIA service component. Only after that should the storage section be connected to the live price board.
