# VIA Follow / Unfollow write boundary

Follow/Unfollow is the next controlled social write after Post, Reply and Like/Unlike.

- Guests remain view-only.
- A restored DeSo Identity session is required; a public key alone is not treated as login or verification.
- VIA first reads the follower's current public follow graph and only then enables the correct Follow or Unfollow action.
- Self-follow is rejected both in the UI and server route.
- VIA constructs the official `create-follow-txn-stateless` transaction with no added transaction fees.
- The exact transaction must be reviewed and approved in the official DeSo Identity window.
- Signed transaction messages are accepted only from the expected Identity origin and popup, then submitted through `submit-transaction`.
- Repost, Diamond and media write actions remain protected and unreleased.

Diamond remains behind the stronger value-transfer consent boundary because it transfers DeSo value rather than only changing a social relationship.
