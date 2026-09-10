# VIA optional profile local time

Status: product and privacy rule for later profile/settings implementation.

## Purpose

VIA is an international meeting place. A creator or visitor may choose to help other people understand when it is morning, afternoon or evening where they are.

This is optional. VIA must never require a person to publish a location or local time in order to use the platform.

## User choice

In My VIA -> Profile settings, a user may choose to provide:

- country;
- optionally city or region;
- optionally an IANA time zone;
- whether local date/time is shown publicly on the profile.

The setting must explain in plain language that it is optional and can be changed or hidden later.

Suggested guidance copy:

> Optional — helps international visitors know your local time. You can change or hide this anytime.

## Accuracy rule

Country alone must not be used to guess an exact local time when that country spans multiple time zones. For example, a public profile that only says `United States` is not enough to infer New York, Chicago, Denver or Los Angeles time.

VIA may show an exact local date/time only when a sufficiently precise time zone is explicitly available from a public profile field or voluntarily selected by the user.

Examples:

- `Netherlands · Local time 10:31 · Thursday 10 September`
- `United States · Local time not specified`
- `New York, United States · Local time 04:31 · Thursday 10 September`

Use an IANA time-zone identifier for automatic daylight-saving/time-zone changes. Do not store a manually maintained UTC offset as the source of truth.

## Privacy boundary

VIA must not silently determine, infer or publish a user's precise location from IP address, device location, browser geolocation, wallet activity or other background signals for this feature.

Public display must be based on information the user has intentionally made public or voluntarily selected for this purpose.

No location/time-zone field is required for login, posting, browsing, NFT ownership, minting or ordinary VIA participation.

## Personal guide / onboarding

The future VIA personal guide must mention this choice during profile setup. It should state:

1. location and local-time display are optional;
2. they can make international contact easier;
3. the user decides how much location detail to show;
4. the setting can be changed or hidden later;
5. VIA does not need precise location to use the platform.

The guide must not pressure the user to enable the feature.

## Implementation boundary

This document does not enable geolocation, profile writes, login, wallet access or blockchain transactions. Profile/settings implementation must first be reconciled with the current VIA profile and authentication architecture.