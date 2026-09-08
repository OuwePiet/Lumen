# VIA active build tracks

VIA is developed in independent tracks so safe work can move in parallel without having multiple branches edit the same source file.

## Track A — DeSo / NFT

- Public collection browsing remains read-only until a wallet-authorized action is explicitly designed.
- DeSo remains authoritative; caches are optional acceleration only.
- NFT media remains untrusted remote input and is limited to VIA's validated HTTPS/IPFS handling.

## Track B — World Discovery

- Around the World, New Voices, NFT Window, Surprise Me and World Radio are active discovery surfaces.
- Geographic labels are navigation context only. VIA does not infer a creator's private location.
- Paid placement must never be presented as organic discovery.

## Track C — VIA LIVE

- Audio-first community flow: listen, request to speak, explicit recording decision, then optional Replay publication.
- Recording is never silently enabled.
- External meeting or recording providers are not presented as integrated until their current API, permissions and legal requirements are verified.

## Track D — World Quest

- Daily Grid, Alphabet Relay and VIA NEO PONG remain casual/local game experiences.
- Client-visible or locally validated game state is not authoritative for a real DeSo reward.
- A real winner reward may never exceed one VIA Diamond Shower per winner and reward moment and requires a separately verified payout flow.

## Track E — Security / resilience

- VIA never receives, stores, logs or backs up the DeSo account's 24-word recovery phrase.
- A public key alone is not proof of wallet control.
- Sensitive on-chain actions require explicit authoritative wallet control and user confirmation.
- No guaranteed uptime, hack-proof, copy-proof or absolute legal/security claims.

## Merge discipline

Each track should use its own branch and preferably distinct files. Preview builds must complete before merge. Changes that touch shared navigation, shared APIs or signing boundaries are merged one at a time and rechecked against current `main` first.
