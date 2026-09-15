# VIA homepage — Open Earth layout

Canonical homepage layout after the 15 September 2026 visual review.

- No white tagline on the homepage.
- No green word row on the homepage.
- The rotating Earth is the visual center and must remain largely unobstructed.
- Homepage controls are grouped in a calm left rail: VIA logo, main navigation, utility controls, then Explore NFTs / Join the Community / Create a Post / Go Live.
- Featured in VIA is a vertical right rail: two world-city windows, Sponsor VIA / Best Performer split block, then two world-city windows.
- World Clock, New York, London, Amsterdam, Tokyo, Los Angeles, live $DESO and Your DESO sit low on the page.
- World Radio remains available.
- The homepage does not show NASA branding or source copy.
- The approved original VIA logo asset is `/public/via-logo-original.jpg`; do not replace it with the synthetic SVG.
- The Earth video uses the NASA SVS rotating-Earth video with the VIA proxy and local poster as fallbacks.
- The Earth media uses `object-fit: contain` so the globe is not cropped merely to fill the viewport.
- Other VIA pages may keep the normal global header; the homepage itself uses the dedicated left rail.

Recovery rule: inspect the actual branch files before changing this layout. Do not restore prior white/green hero text or the old horizontal five-card homepage unless explicitly requested.