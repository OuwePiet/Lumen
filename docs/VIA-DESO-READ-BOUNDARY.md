# VIA DeSo read boundary

Baseline: **viadeso.online**. Public product name: **VIA**.

## Active now

VIA has a small server-side DeSo read foundation in `lib/via/deso-read.ts`.

The boundary is deliberately narrow:

- public/read-only requests only;
- configurable `DESO_NODE`, defaulting to `https://node.deso.org`;
- no transaction construction or broadcast;
- no signing;
- no seed phrase/private-key storage;
- no silent wallet authority;
- remote blockchain/media data remains untrusted input;
- failures return a neutral unavailable state rather than pretending an action succeeded.

## Next safe integrations

Use this boundary for verified public profile, post, creator and NFT reads one feature at a time. Validate the actual DeSo endpoint contract before connecting each UI surface.

## Not activated by this foundation

Follow, like, repost, Diamonds, posting, messaging, minting, bids, sales, transfers, burns and any other blockchain write remain outside this boundary. Those require a separately reviewed explicit wallet/signing flow.
