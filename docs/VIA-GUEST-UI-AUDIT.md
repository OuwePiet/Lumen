# VIA Guest UI Audit

## Current finding

The current Social surface already keeps public posts readable while describing publishing, follow, like, repost and Diamonds as outside its read-only boundary. It also keeps local drafting separate from future DeSo publishing.

Discover is public navigation/discovery. Local Saved functionality is browser-local and does not create VIA, DeSo or blockchain state.

Show Your Stuff previously contained obsolete copy about a future simple showcase route for makers who were not ready to use DeSo. That wording has been removed: participation now opens through DeSo.

## Gate implementation

A reusable `ParticipationGate` component now expresses the agreed boundary without pretending that a DeSo authentication implementation already exists. It must be connected to real write controls only after the current DeSo login/session mechanism is verified.

Do not use a displayed public key as login state. Do not invent a cookie/session flag. Do not make a button look operational before the corresponding DeSo authority/signing flow exists.

## Next application order

1. verify current DeSo login/account/funding path;
2. connect one reliable authenticated participation state;
3. gate Social write controls;
4. gate Show Your Stuff / First Maker Space creation;
5. gate Community write controls and messaging;
6. keep NFT/financial actions behind the stronger transaction preflight and signing path.
