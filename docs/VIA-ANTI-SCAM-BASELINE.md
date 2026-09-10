# VIA Anti-Scam Baseline

VIA's anti-scam model is layered. No single login, payment or technical check is treated as proof of trust.

## Layer 1 — Guest containment

Guests can use public discovery but cannot create public/community state. This removes anonymous posting, unsolicited contact, anonymous maker-space claims and anonymous financial actions from the normal VIA entrance.

## Layer 2 — DeSo participation gate

Social participation uses the verified DeSo authentication/account route. DeSo's own current balance or funding restrictions may add useful economic friction against mass account creation, but VIA does not label a funded account as safe or verified.

## Layer 3 — Behaviour controls

VIA-controlled write surfaces should support rate limits and cooldowns, duplicate/burst detection, malicious-link handling, upload validation, impersonation reporting and proportional restriction of repeated abuse.

## Layer 4 — Sensitive transaction boundary

NFT, payment and other blockchain writes require the separate transaction flow: construct/preflight, show the action and costs, explicit consent, user signing, broadcast and verification. Social login alone must never authorize a financial action.

## Layer 5 — Recovery and transparency

Restrictions should fail safely. VIA should avoid exposing secrets in client code or logs, keep useful security events, and provide understandable feedback where doing so does not help an attacker bypass controls.

## Never claim

- paid = trusted;
- DeSo account = verified person;
- public key = proof of current control;
- login = permission for every action;
- one anti-bot check makes VIA scam-proof.
