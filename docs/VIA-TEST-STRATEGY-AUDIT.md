# VIA Test Strategy Audit

viadeso.online is the active VIA baseline. Historical test documents are retained as idea stock, but their assumptions are not automatically valid tests for the current product.

## Keep as testing principles

- Test responsive behavior on phone, tablet and desktop.
- Test public DeSo reads with success, empty, malformed, slow and unavailable responses.
- Verify that public VIA views reflect authoritative DeSo data rather than treating a cache as the source of truth.
- Test navigation and return paths, including creator search, collection, NFT detail, Social and My VIA.
- Test accessibility: keyboard operation, visible focus, meaningful labels, reduced-motion behavior where applicable and usable empty/error states.
- Test remote media defensively: invalid URL, failed image, unsupported media, HTTPS/IPFS validation and layout stability.
- For any future on-chain action, test explicit consent, wallet-control verification, transaction construction, rejection/cancel, network failure, duplicate submission and recovery before release.
- Test rate limits and abuse boundaries for any future paid, sponsored, automated or high-volume action.

## Historical tests that are not current acceptance criteria

The old checklist assumes features and architecture that VIA has not adopted, including Supabase as mandatory infrastructure, WhatsApp commerce, Zapier/Make notifications, silent Derived Keys, platform-wallet gas sponsorship, bulk minting and automatic auction acceptance. These must not be presented as failed VIA tests merely because they are intentionally absent.

The old target that another DeSo surface must show a write within an exact two-second window is also not a safe product guarantee. Cross-client propagation depends on network and external-client behavior. Future sync tests should verify eventual authoritative DeSo visibility with measured timings, not promise an arbitrary universal deadline.

## Explicitly rejected test behavior

- Do not test for a derived private key being present in `sessionStorage`; VIA must not make browser storage of private signing material a success condition.
- Do not require bids/mints/transfers to occur silently without user-visible authorization merely to reduce friction.
- Do not use a central VIA seed phrase/platform wallet as the assumed solution for gas sponsorship.
- Do not treat a hard-coded public-key comparison as a successful admin-security test.

## Current release gate

For present read-only/public work, a change should at minimum:

1. preserve VIA-only public naming and viadeso.online as baseline;
2. keep wallet/private-key authority unchanged unless the PR explicitly targets and reviews it;
3. handle loading, empty and failure states without false success claims;
4. avoid making external provider availability or timing guarantees;
5. pass the repository's configured build/deployment checks before merge;
6. be reviewed for mobile usability and accessibility when UI is changed;
7. document deferred or intentionally excluded historical behavior rather than silently dropping it.

## Phase 3 / decision required

A larger automated test suite should be chosen when the stable production contracts justify it. The current repository does not need a heavy test framework added only to imitate historical checklists. Future test investment should follow the actual VIA architecture: API contract tests, critical UI flows, security boundaries and carefully isolated on-chain test flows.
