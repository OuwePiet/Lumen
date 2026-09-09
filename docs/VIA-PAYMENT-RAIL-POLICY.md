# VIA Payment Rail and Live Pricing Policy

viadeso.online remains the active VIA baseline. This policy records the agreed commercial direction without implementing custody or reopening approved UI.

## Price basis

VIA services are priced in ordinary currency. EUR and USD are the primary commercial reference currencies; additional supported fiat currencies may be displayed when a reliable conversion source is available.

DESO is an optional small-value payment rail, not VIA's accounting unit and not an asset VIA intends to accumulate.

## Automatic price updates

The VIA price board and every service quote that depends on market conversion must use a shared current-rate source and refresh automatically on a defined interval.

Rules:

- show when a displayed rate was last updated;
- do not silently invent a rate when the source is unavailable;
- a stale last-known rate must be labelled stale and must not automatically authorize a new payment;
- checkout creates a short-lived immutable quote from the current verified rate so the amount cannot change during confirmation;
- every accepted quote records currency pair, source timestamp, quote timestamp, expiry and calculated amount;
- the same quote logic must be reused by storage and later paid VIA modules rather than each module calculating its own rate.

## Prepayment

Paid VIA services are delivered only after the selected payment provider or verified blockchain payment state confirms the required amount.

A pending, expired, underpaid, failed or ambiguous payment must not start a paid storage/service action automatically.

Provider callbacks/webhooks must be authenticated and payment execution must be idempotent so a duplicate callback cannot purchase or execute a service twice.

## Multiple payment services

VIA may support several payment providers/rails. Provider choice remains replaceable and is not hard-coded into the product model.

Before a provider is enabled its current availability, supported countries/currencies, fees, refunds, chargebacks, settlement behavior, API/webhook security, privacy and legal requirements must be verified.

## Small DESO payment rail

If a customer elects to pay with DESO:

1. the service keeps its EUR/USD reference price;
2. VIA obtains a current verified DESO conversion rate;
3. VIA calculates and shows the required DESO amount plus quote expiry;
4. a maximum permitted fiat-equivalent value per DESO payment is enforced;
5. payments above that maximum must use another enabled payment method;
6. the service starts only after VIA verifies the required DESO payment state.

The exact maximum DESO payment value is deliberately not hard-coded yet. It must be selected before launch based on risk, transaction cost and practical use. The policy requirement is that large DESO payments are not accepted through this rail.

## DESO holding and sweep rule

VIA does not intentionally retain a material DESO balance.

The agreed operational target is: DESO received through the small-value payment rail is associated with the OuwePiet receiving account, and when the held DESO reaches approximately USD 5 in current fiat-equivalent value it should be swept to the designated desomunt treasury account.

This is a functional requirement, not permission to embed a seed/private key or implement an unsafe hot wallet.

Before automatic sweep is enabled, the implementation must prove:

- authoritative control/signing without exposing a seed or derived private key to browser, repository, logs or public environment variables;
- exact destination configuration through protected server-side configuration;
- current-rate threshold calculation;
- transaction fee handling so the sweep cannot strand or repeatedly churn dust;
- idempotency/locking so concurrent checks cannot double-send;
- submitted transaction verification and durable transaction reference;
- retry behavior that distinguishes failed, pending and already-submitted transfers;
- an emergency pause/disable mechanism;
- auditable status without logging signing secrets;
- recovery procedure for provider/node/signing failure.

Until these controls are implemented and tested, the USD 5 sweep remains an approved requirement but automatic signing remains disabled.

## No DESO treasury by accident

The sweep monitor evaluates the fiat-equivalent value using a current verified quote. VIA must not deliberately wait for a favorable DESO price or speculate with customer-derived receipts.

A price-source outage pauses automatic threshold decisions rather than guessing a value.

## Separation of responsibilities

These are separate state machines and must not be collapsed into one client-side action:

- live price display;
- checkout quote;
- payment confirmation;
- service entitlement/execution;
- DESO balance monitoring;
- DESO treasury sweep;
- DeSo NFT/post signing.

A failure in one must not silently repeat another.

## Acceptance criteria before production payment

- shared automatic rate service defined and tested;
- visible last-updated/stale state on price board;
- short-lived checkout quote with expiry;
- at least one verified payment provider and authenticated callback flow;
- idempotent payment-to-service execution;
- exact DESO maximum value selected and enforced before DESO payments go live;
- DESO amount calculated from fiat reference price, not vice versa;
- no large DESO payments accepted;
- no seed/private key in browser/repository/logs;
- USD 5 sweep cannot double-send and can be paused;
- service delivery waits for confirmed payment;
- refunds/failures/underpayments have explicit states;
- every money-moving action has a durable reference suitable for audit/reconciliation.
