# VIA Digital Ownership

VIA treats an NFT as more than a media card. The Digital Ownership layer keeps six concerns separate so the interface never implies guarantees the underlying data cannot prove.

1. **Ownership** — current DeSo NFT entries and edition ownership.
2. **Media** — referenced media and whether the reference is content-addressed or externally hosted.
3. **Rights** — explicit creator-origin rights declarations; NFT ownership is not automatically copyright ownership.
4. **Royalties** — bounded creator/coin royalty information when present; missing legacy values are not inferred.
5. **Utility** — declared access, ticket, download, community, external-app or custom utility. Metadata alone grants nothing.
6. **Verify** — current ownership may be checked against live DeSo data, while control of a public key requires a separate authenticated identity proof.

## Trust boundaries

- Read-only blockchain/API data may be displayed without authentication.
- A public key is an identifier, not proof that the viewer controls it.
- Private utility must re-check current ownership and authenticated identity at use time.
- External utility targets are data until a future explicitly controlled action validates and opens them.
- Creator declarations describe what was declared; VIA does not turn them into statutory copyright transfer or legal advice.
- Reachability of a DeSo endpoint is operational health, not a consensus/trust guarantee.

## Project provenance

VIA project provenance is maintained separately from NFT ownership in `lib/via/project-provenance.ts`. Product authorship and ownership of an individual NFT are intentionally different concepts.
