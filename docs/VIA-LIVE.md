# VIA LIVE — Audio Rooms, Replay and Media Health

## Purpose
VIA LIVE is an audio-first community space for live conversations without requiring participants to use a camera. It is designed for DeSo communities, creator talks, town halls and recurring meetings such as community Sunday sessions.

## Product boundary
VIA LIVE must not pretend that an external meeting provider is natively integrated until its current API, permissions and terms have been verified. An external meeting link can first be shown as a clearly labelled external join option.

The four actions are deliberately separate:
1. Listen live.
2. Request/receive permission to speak.
3. Record, only when the host has enabled recording and participants are clearly informed.
4. Publish a Replay, only as an explicit host action.

No camera is required for the VIA audio-first experience. A DeSo profile name/avatar may be shown where reliable public profile data is available.

## Replay
A permitted recording can become a VIA Replay with:
- title and date;
- host and consenting/public participants where appropriate;
- description and topics;
- audio player;
- optional chapters/timestamps;
- optional transcript/summary after separate accuracy and privacy review;
- explicit DeSo sharing action once posting/signing is connected and verified.

A Replay is never silently published just because a live session was recorded.

## Recording and privacy baseline
- Recording is off unless deliberately enabled by an authorised host.
- VIA must display a clear recording state.
- Participants must be informed before their audio is recorded.
- Host controls recording and publication separately.
- Do not claim that silence or merely joining constitutes legal consent in every jurisdiction.
- Retention/deletion controls must be defined before production recording is enabled.
- External meeting-provider recording rules and applicable law must be checked before technical integration.

## Publication guide
VIA will publish a user guide only for functionality that actually exists and has been tested. The guide will have two levels.

### VIA LIVE in one minute
- Open the LIVE room.
- Choose Listen or request to Speak.
- Camera is not required for an audio-first room.
- Check the visible recording indicator before speaking.
- If a Replay is published, open it later from the room/episode page.

### Host guide
The full host guide will document starting a room, sharing access, speaker moderation, recording controls, ending a room, reviewing a recording and explicitly publishing a Replay. Provider-specific steps are added only after the provider integration is verified.

## Media Health
VIA should diagnose media failures instead of immediately blaming DeSo or a single app.

A future Media Health panel should distinguish at least:
- VIA application availability;
- DeSo node/API reachability;
- image/media upload service availability;
- media retrieval/gateway availability;
- browser/network/local storage limitations where detectable;
- external provider failures.

Statuses should be factual: `OK`, `DEGRADED`, `FAILED`, or `UNKNOWN`. `UNKNOWN` is preferable to an unsupported claim that DeSo is down.

### Safe diagnostic flow
1. Check VIA itself.
2. Check the configured DeSo endpoint with a bounded request.
3. Check the exact media service used by the attempted operation.
4. Separate upload failure from later media retrieval failure.
5. Preserve useful error category/timestamp without logging seed phrases, private keys, signing secrets or sensitive user content.
6. Give the user a simple result such as: `VIA OK · DeSo reachable · Media upload failed`.

## Security
VIA LIVE and Media Health never request a DeSo seed phrase or private key. Listening, diagnostics and Replay playback are read-only. Any later DeSo publishing or tipping action must use the separately verified wallet signing flow.

## Cost control
Start with read-only/external-link and client playback foundations. Do not proxy large live audio streams or recordings through VIA infrastructure by default. Storage, streaming, transcription and provider costs must be measured before production recording is offered.

## Implementation order
1. Publish product/privacy/diagnostic architecture.
2. Build read-only LIVE/Replay interface with explicit unavailable/not-connected states.
3. Build Media Health diagnostics for services VIA actually uses.
4. Verify external meeting provider APIs, permissions, recording rules and commercial terms.
5. Add a tested provider adapter.
6. Add recording/storage only after consent, retention, security and cost controls are complete.
7. Publish the final provider-specific user manual after the working implementation has been tested.
