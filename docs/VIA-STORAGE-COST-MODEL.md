# VIA Storage Cost Model

Verified: 2026-09-09. This document converts the recovered VIA storage/module decisions into a current cost baseline. It does not yet publish customer prices.

## Current provider baseline

### Cloudflare R2 Standard

Official current pricing verified against Cloudflare documentation:

- storage: USD 0.015 per GB-month;
- free tier: 10 GB-month per month;
- Class A operations: USD 4.50 per million after 1 million free per month;
- Class B operations: USD 0.36 per million after 10 million free per month;
- direct Internet egress: free;
- no retrieval charge for Standard storage;
- S3-compatible API is available.

R2 therefore remains a strong fit for the historical Module L.1 role: VIA-served media, previews and paid uploads, while keeping implementation behind a provider adapter.

Do not allocate the account-wide free tier as a guaranteed saving to an individual customer. Sustainable customer pricing must still work when VIA exceeds free allowances.

### Pinata / IPFS route

Current public Pinata pricing verified:

- Free: 1 GB storage;
- Picnic: USD 20/month, 1 TB included;
- Picnic extra storage: USD 0.07/GB;
- Fiesta: USD 100/month, 5 TB included;
- Fiesta extra storage: USD 0.035/GB;
- bandwidth and request allowances/overages are separate.

Pinata remains an optional IPFS route, not VIA's universal storage backend. IPFS is useful when the product specifically needs a content-addressed IPFS reference/CID. VIA should retain the CID so migration to another compatible pinning/provider route remains possible.

## Cost calculation rules

VIA storage prices must be calculated from actual service obligations rather than storage bytes alone.

For each tier, model at least:

1. provider storage cost over the promised retention period;
2. write/read/request cost under a conservative usage assumption;
3. payment-provider cost;
4. migration/recovery/support allowance where VIA sells a managed service;
5. taxes/legal costs where applicable;
6. a modest transparent VIA service component.

Never describe recurring provider storage as "pay once, keep forever" unless VIA has separately funded the full retention obligation and can substantiate it. A one-time customer price creates a future liability when the upstream provider bills monthly.

## Historical VIA tiers

Keep these as product-size anchors while prices are recalculated:

- 10 MB
- 50 MB
- 100 MB
- 500 MB
- 500 MB-5 GB archive
- 50-500 GB museum/collection
- 1 TB+ institutional/custom

The old EUR 2.90 / 7.90 / 14.90 / 34.90 / 149 figures are historical customer-price inventory, not live rates.

## Price-board architecture

The price board should consume versioned VIA pricing configuration, not scrape provider websites in the browser.

Configuration should record:

- provider identifier and pricing-source verification date;
- provider cost assumptions;
- tier size and retention/service terms;
- VIA service component;
- customer fiat price;
- effective-from timestamp;
- stale/verification deadline.

The UI can refresh configuration periodically and show last-updated status. If provider pricing is overdue for verification, mark the affected storage price as requiring review rather than silently presenting it as current.

DESO is not the storage pricing unit. At checkout, a supported small DESO payment is calculated from the fiat customer price using the separately verified live DESO rate and a short-lived quote.

## Implementation boundary

Next code step: add provider-neutral storage pricing configuration/API and a read-only storage price-board component. Do not add upload credentials, R2 buckets, IPFS secrets, checkout, DESO signing, custody or automatic sweep in that UI step.
