# VIA provider-session preflight

This server-side preflight combines the immutable checkout order, the validated checkout attempt, and current server payment readiness before returning an internal eligible provider-session draft.

A successful response means only that the request is structurally and operationally eligible to continue. It does not create a provider session, charge a payment method, confirm payment, transfer an NFT, sign a wallet transaction, or write to DeSo.

DESO remains blocked by the existing server readiness boundary until it is explicitly released.
