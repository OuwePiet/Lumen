# VIA Social — Following UI integration

Baseline: viadeso.online / VIA.

This step connects the already merged read-only Following API to the Social public-post view.

Safety boundary:
- public DeSo reads only;
- no follow/unfollow mutation;
- no wallet authority, signing or transaction construction;
- bounded server-side Following reads remain in force;
- remote media remains HTTPS-only and rendered without autoplay.

Compatibility correction included in the same UI step: the Social renderer now uses the canonical VIA public-post fields (`postHash`, `imageUrls`, `videoUrls`, `isNft`) returned by `lib/via/deso-post-read.ts`. This prevents the UI from depending on raw DeSo field names.
