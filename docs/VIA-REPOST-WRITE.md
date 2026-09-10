# VIA controlled Repost / Quote Repost

viadeso.online remains the product baseline.

## Released behavior

- Guests remain read-only.
- A restored DeSo Identity session is required before Repost or Quote Repost controls appear.
- VIA validates the active public key and exact 64-character post hash server-side.
- Repost and Quote Repost are constructed through DeSo `submit-post` with `RepostedPostHashHex`.
- Quote Repost accepts plain text only in this release, capped at 5,000 characters.
- The unsigned transaction must be reviewed and approved in the official DeSo Identity popup.
- VIA only accepts a signed transaction message from the exact Identity origin and popup it opened, then submits via `submit-transaction`.
- No private key or seed is handled by VIA.

## Still protected

- Diamond remains unreleased because it transfers value and requires a stronger explicit value/fee consent step.
- Media publishing remains unreleased until its upload/storage/content-safety path is independently verified.
- Repost removal/toggle state is not inferred locally in this release; this step only creates an explicitly approved repost or quote repost.
