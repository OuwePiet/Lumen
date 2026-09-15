# VIA Homepage — final composition and recovery blueprint

Status: approved homepage composition. This file is the canonical recovery note for the VIA homepage. If implementation and memory ever disagree, check this file and the referenced source files before changing the homepage.

## 1. Fixed identity and branch

- Product name: VIA.
- Public domain: `viadeso.online`.
- Repository: `OuwePiet/Lumen`.
- Homepage review branch: `via-home-ultimate-review`.
- Do not reintroduce former public project names.

## 2. Upper navigation and VIA logo

The top of the homepage consists of two horizontal control rows on the right and one VIA logo column on the left.

- The VIA logo is at the upper left.
- The VIA logo occupies the visual height of both button rows together: 130 px in the current desktop implementation.
- It is centered over the left quick-action column below.
- Main navigation row: Home · Social · Discover · Market · Studio · Live · Communities · My VIA.
- `Feed` is not a permanent main-navigation button. Social is the main route to the social area.
- `NFTs` is not a top-navigation button. NFT discovery is a left-side direct action.
- Utility row contains Search members, language, Public Entrance, DeSo Login when logged out, Buy $DESO, one Visitors control, Notifications and the signed-in account control when available.
- Do not add a second Visitors control.

Implementation: `app/via-site-header.tsx`.

## 3. Homepage title area

Seven green words, centered:

`ART · PEOPLE · IDEAS · CREATORS · COLLECTORS · COMMUNITIES · MUSICIANS`

Directly below them is one complete larger white sentence:

`A global space for creators, collectors and communities.`

The sentence is one visual statement; do not intentionally isolate `communities` onto its own line.

Implementation: `app/page.tsx`.

## 4. Four direct actions below the VIA logo

These four controls are shortcuts/actions, not duplicates of the top navigation:

1. Explore NFTs → `/collection`
2. Join the Community → `/communities`
3. Create a Post → `/social`
4. Go Live → `/live`

`Create a Post` goes directly to the released social composer route instead of first forcing a Studio detour.

Implementation: `app/page.tsx`.

## 5. Featured in VIA — five blocks

The Featured section contains five equal visual positions:

- left world-city window 1
- left world-city window 2
- center split block
- right world-city window 1
- right world-city window 2

The center block is split into:

- Sponsor VIA — clearly marked commercial/sponsor space.
- Best Performer — VIA creator recognition, special badge and the agreed `$0.50` creator bonus.

The four outer city windows rotate by month, not rapidly. The selection is global rather than Europe-centered. Current city pool includes Tokyo, New York, Lagos, São Paulo, Seoul, Mumbai, Sydney, Paris, Mexico City, Cape Town, Amsterdam and Singapore.

City images are requested from Wikimedia Commons with image/license metadata. A city card falls back to the VIA graphic treatment when a suitable remote image is unavailable; never show an invented image or broken empty box.

In December the image query asks for Christmas-light/city imagery. The response is cached for the month and keeps stale data usable during temporary upstream failure.

Implementation:

- `app/via-featured.tsx`
- `app/api/via/featured-cities/route.ts`

## 6. Seasonal accents

Seasonal decoration must remain subtle and must never interfere with controls.

- Winter: December, January and February use very light slow snowfall.
- Reduced-motion preference disables snowfall.
- Easter: Good Friday through Easter Monday shows restrained rabbit and decorated-egg accents.
- Seasonal layers are pointer-events none.

Implementation: `app/via-seasonal.tsx`.

## 7. NASA Earth background and credit

The rotating Earth is NASA imagery/video. The homepage must give NASA a small source credit at the lower left; there is no second VIA logo in this lower strip.

Current NASA SVS source page:

`https://svs.gsfc.nasa.gov/30082/`

VIA serves the video through `/api/nasa-earth`. A local poster remains underneath as the fallback:

`/via-earth-approved.jpg`

The video changes to the poster only on a real media error. A temporary `stalled` event must not permanently disable the video.

Bottom credit asset:

`/nasa-credit.svg`

Visible credit text:

`Earth imagery/video: NASA`

Implementation:

- `app/via-home-earth.tsx`
- `app/api/nasa-earth/route.ts`
- `public/via-earth-approved.jpg`
- `public/nasa-credit.svg`

## 8. Final lower information strip

After Featured in VIA, the homepage ends with one compact information strip. Do not place a VIA logo here.

Order:

1. small NASA source mark + `Earth imagery/video: NASA`
2. `World Clock`
3. New York
4. London
5. Amsterdam
6. Tokyo
7. Los Angeles
8. current `$DESO` reference price in USD
9. `Your DESO` for the account currently signed in with DeSo Identity

World clocks are calculated with IANA time zones and therefore follow daylight-saving changes automatically.

The DESO reference price uses the existing VIA live-rates route and refresh logic. If the rate is stale/unavailable, display `—`; never invent a rate.

`Your DESO` uses the active DeSo Identity public key and `/api/via/wallet`. If nobody is signed in, or the balance cannot be read, display `—`; never invent a wallet balance. Login/logout session events update this strip without requiring a page reload.

Do not put the placeholder `Total visitors —` in this lower strip. A reliable aggregate visitor total may only be shown when a real counting source is connected.

Implementation:

- `app/via-world-clock.tsx`
- `app/via-live-rates.ts`
- `app/api/via/rates/route.ts`
- `app/api/via/wallet/route.ts`
- `app/deso-identity-session.ts`

## 9. Failure and recovery rules

- NASA video unavailable → show `/via-earth-approved.jpg`.
- DESO price unavailable/stale → show `—`.
- User logged out or wallet unavailable → `Your DESO —`.
- Featured city image unavailable → keep the city card and VIA fallback treatment.
- Visitor count unavailable → do not fabricate a number.
- External image/source errors must not break the rest of the homepage.
- Never say a Vercel build is green until the status of the exact final commit has been checked.

## 10. Change discipline

Before changing the homepage:

1. Read this file.
2. Read the actual current branch files.
3. Preserve all already-approved homepage elements unless the user explicitly changes them.
4. Avoid duplicate buttons and duplicate functions.
5. Update this recovery file when an approved homepage decision changes.
6. Verify the exact final commit and both Vercel project checks before calling the homepage finished.
