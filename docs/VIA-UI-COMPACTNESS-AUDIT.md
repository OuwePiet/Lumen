# VIA UI Compactness Audit

viadeso.online remains the active VIA baseline.

## Current inspected baseline

The current Home collection uses restrained VIA greens rather than a neon text-shadow treatment. The main collection heading is already bounded with `clamp(27px, 4vw, 44px)` and the top-left VIA brand is 14px. These values should not be enlarged.

The NFT detail view currently uses a compact title (`clamp(22px, 2.5vw, 30px)`) but allows the square media frame to grow to 440px. This is the clearest remaining laptop-scale target from the earlier feedback that NFT detail media felt too large.

## Next implementation target

Reduce the desktop/laptop detail-media maximum while preserving `width: 100%` for smaller devices. The change should be previewed before merge so that image detail remains useful and the information card does not become visually dominant.

Suggested target range: 380–400px maximum on wider screens, with no forced reduction on narrow mobile layouts.

## Visual rules retained

- black/dark VIA base;
- muted green accents, no excessive glow;
- smaller, consistent typography on laptop;
- NFT artwork remains sharp and fully visible (`object-fit: contain` on detail);
- no people or identity imagery added as decoration;
- final custom VIA logo remains a separate design/approval track.
