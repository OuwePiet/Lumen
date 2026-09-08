# VIA World Radio

Status: planned integration, discovery/provider validated at architecture level; station/content rights remain third-party responsibilities and must be respected per station.

## Product goal

VIA World Radio is a lightweight optional companion to the social/NFT experience. Users should be able to discover public internet radio by country, language, genre or station and keep listening while navigating VIA.

It is not a core dependency: feeds, profiles, NFT pages and Studio must continue to work if the radio directory or a station stream is unavailable.

## Discovery source

Radio Browser is a suitable candidate for station discovery because its directory is community-driven, its collected station metadata is public-domain, and its API is free/open for use in free and non-free software. VIA must not treat the directory as an uptime-guaranteed service.

Implementation rules:
- use station UUIDs, not legacy numeric IDs;
- use countrycode rather than free-form country fields where possible;
- discover/rotate API mirrors rather than hard-code one permanent mirror;
- send a descriptive VIA User-Agent from server-side requests;
- query only bounded result sets and prefer stations marked healthy;
- cache non-sensitive station metadata briefly to reduce unnecessary directory traffic;
- never claim that Radio Browser licenses the underlying audio.

## Player design

A compact VIA player should support:
- play/pause;
- station name and country/language;
- favourite stations stored as non-secret local preferences;
- country, language, genre/tag and station search;
- persistent playback while navigating VIA where browser/platform behaviour permits;
- a clear external station/homepage link;
- graceful failure when a stream is offline, blocked, unsupported or requires another transport.

VIA should link/play the station's public stream rather than proxy, record, download, restream or permanently store radio audio by default. Streams are third-party content and remain subject to the station/broadcaster's rights and terms.

## Privacy and security

Station URLs and metadata are untrusted external input. Validate protocols and render names/tags as text, never executable HTML. Do not send DeSo wallet/session secrets to stations or the directory. Radio must not weaken VIA's CSP/security model when that policy is introduced.

## Monetisation

The ordinary World Radio experience stays free.

Potential platform revenue, only when transparent and contractually permitted:
- clearly labelled Sponsored Station / Station of the Day placements;
- paid station promotion in discovery results, visibly marked as sponsored;
- referral/affiliate arrangements where a station or partner explicitly offers them;
- voluntary VIA support/DeSo Diamond pathways outside the audio stream;
- broader VIA sponsorship inventory that does not interrupt playback or masquerade as organic social content.

No hidden commission, forced audio ads injected by VIA, pay-to-play disguised as ranking, or removal/circumvention of a station's own advertising.

## Before launch

1. Build a server-side Radio Browser directory adapter with bounded search and mirror fallback.
2. Build the compact client player without audio proxying.
3. Test iPhone/iPad/desktop playback and navigation behaviour.
4. Add source attribution/about information and a station/report/removal path.
5. Review the terms/rights of any stations selected for editorial or sponsored promotion.
6. Keep monetisation disabled until sponsorship/referral terms and disclosures are explicit.
