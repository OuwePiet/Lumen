# VIA Phase 3 — Reliable lifetime visitor total

Status: deferred implementation; requirement retained.

## Requirement

Home may show a real cumulative `Total visitors` figure beside VIA's world clock only after a trustworthy aggregate source has been connected and verified.

## Current Home behaviour

The world clock deliberately renders `Total visitors —`. VIA must not fabricate a total and must not present a device-local or session-only count as a platform-wide visitor total.

## Why deferred

A reliable lifetime counter needs durable persistence, a clear definition of what counts as a visit, sensible bot/reload handling, and continuity across deployments. Client-side local/session storage cannot provide an authoritative VIA-wide total.

## Acceptance criteria

- Persistent across devices and Vercel deployments.
- Does not reset when VIA is redeployed.
- Avoids obvious reload inflation.
- Stores/exposes aggregate data only; no unnecessary visitor identity tracking.
- Failure degrades to the dash rather than showing a guessed or stale number as fact.
- The source and counting semantics are documented before the number is labelled `Total visitors`.

This Phase 3 record exists so the visitor-counter requirement cannot silently disappear while the active build continues.