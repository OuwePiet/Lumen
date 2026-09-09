# VIA Quick Menu — retained stock

viadeso.online remains the product baseline.

## Historical idea

A historical development briefing proposed a personal quick menu for creators/profiles that travels with the user across devices by storing the selected creator links through DeSo User Associations instead of only browser-local storage.

## Why the idea is useful

- Gives frequent visitors a fast route back to creators they follow closely.
- A DeSo-backed version could follow the user across devices without VIA maintaining a private preference database.
- Fits VIA's DeSo-first principle better than inventing a mandatory off-chain profile store.

## Why it is not active yet

Creating or deleting a User Association is an on-chain write. VIA's current public browsing and Social work deliberately stays read-only unless wallet authority, user confirmation, transaction construction, failure handling and recovery are explicitly verified.

A public key or typed username is not proof of wallet control, so VIA must never write a quick-menu association merely because a visitor entered an identity.

## Safe implementation path

1. A browser-local quick list may be used as an optional non-authoritative convenience layer.
2. A future cross-device DeSo version must be opt-in and require verified wallet/account control.
3. The association type/value namespace must be VIA-specific and documented before any transaction is created.
4. Reads must tolerate missing, malformed or duplicate associations.
5. Removing an item must require the same verified authority and explicit user action as adding one.
6. VIA should not claim the list is private: on-chain associations may be publicly observable.

## Status

Requirement retained for later implementation. No on-chain write is introduced by this stock record. Nothing from the historical quick-menu idea is silently discarded.
