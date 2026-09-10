# VIA Reply Write Path

VIA releases direct plain-text replies only after the base text-post path is working.

## Flow

1. Public posts remain readable by guests.
2. A Reply control appears only when a valid restored DeSo Identity session is present.
3. VIA sends the reply text plus the exact parent post hash to the existing submit-post construction endpoint.
4. The parent hash must be a 64-character hexadecimal DeSo post hash.
5. VIA shows the network fee returned by DeSo when available.
6. The exact prepared transaction opens in the official DeSo Identity approval window.
7. VIA accepts a signed transaction only from that official origin and the popup it opened.
8. VIA broadcasts only the signed transaction returned after explicit approval.

No seed/private key is collected by VIA. Reply does not unlock like, Diamond, follow, repost, media upload or any financial action.
