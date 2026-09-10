# VIA · DeSo-native polls

Status: foundation only. Voting is not released yet.

## Principle

VIA should not invent a separate poll database when DeSo already provides post associations that can represent votes on-chain.

A VIA poll should therefore be split into two parts:

1. The post itself remains a normal DeSo post.
2. Each vote is represented by a DeSo post-association transaction tied to that post.

## Why this fits VIA

- DeSo remains the technical source of truth.
- VIA does not need permanent private poll storage.
- Voting remains an explicit blockchain write instead of a hidden app-side mutation.
- Guests can read poll information, while voting requires an authenticated DeSo identity.
- A vote must never be inferred from login alone; the exact transaction must still be reviewed and approved.

## Safe release path

Before enabling the first vote button:

1. Verify the exact current DeSo association type/value convention used for polls.
2. Verify how poll options are encoded and how duplicate/multiple votes are represented or prevented.
3. Add a read path that can count and display current vote associations without changing DeSo state.
4. Add a prepare route that validates voter public key, target post hash and selected option.
5. Return the exact unsigned DeSo transaction plus fee information.
6. Require explicit user confirmation and DeSo Identity signing.
7. Submit only the signed transaction through DeSo.
8. Re-read the poll from DeSo after submission instead of trusting optimistic local state.

## Guardrails

- No VIA-only permanent vote ledger.
- No automatic voting.
- No background signing.
- No silent vote change.
- No claim that login means trust or verification.
- Rate limiting and anti-bot protection remain useful at the VIA interface layer.

## Open questions to resolve against current DeSo behavior

- Exact association type/value naming for poll responses.
- Maximum number of options and option text limits.
- Whether a voter can replace a previous response and, if so, how DeSo represents that change.
- How deleted associations should affect counts.
- Whether the poll definition itself is encoded in post ExtraData, BodyObj, or another convention used by current DeSo clients.

Until those points are verified, polls stay visible only as a protected upcoming capability and are not presented as operational.