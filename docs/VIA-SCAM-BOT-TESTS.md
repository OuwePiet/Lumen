# VIA Scam and Bot Tests

Before a participation surface is considered ready, test at least these cases:

1. Guest attempts a write action: no state changes; route offers DeSo participation instead.
2. Guest directly calls a future write endpoint: endpoint rejects without valid authority.
3. Public key is supplied without proof of control: no participation authority is granted.
4. Authenticated account repeats identical posts rapidly: rate/cooldown protection can contain the burst.
5. Authenticated account sends repeated unsolicited links: protection can restrict the behaviour without blocking public reading.
6. Deceptive display name/profile attempts to impersonate another creator: reporting/restriction path exists before creator claims are promoted.
7. Funded account performs scam-like behaviour: funding does not bypass behaviour controls.
8. Compromised legitimate account attempts a financial action: social login alone cannot sign or approve the transaction.
9. Transaction details change after preflight: previous consent becomes invalid.
10. External media/link fails or becomes malicious: VIA fails safely and does not treat external content as trusted code.

These are baseline acceptance tests, not a claim that every scam can be detected automatically.
