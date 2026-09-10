# VIA Reply Abuse Checks

Direct replies create person-to-person contact, so they need tighter abuse handling than public reading.

Before expanding replies further, VIA should preserve these rules:

- guests cannot reply;
- a valid DeSo Identity session is required;
- the parent post hash is validated before transaction construction;
- empty or oversized replies are rejected;
- every reply requires explicit DeSo Identity approval;
- repeated high-frequency replies should be rate limited before large-scale release;
- repeated near-identical unsolicited replies should be treated as spam signals;
- external links inside replies remain untrusted content;
- blocking/reporting/muting should be added before messaging or other more direct contact features;
- a funded or old DeSo account is not exempt from abuse controls.

These controls reduce bot/scam reach while keeping ordinary conversation possible.
