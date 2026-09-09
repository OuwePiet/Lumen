# VIA Storage Track

VIA Storage is an independent platform track. It is not only NFT media storage.

## Scope

The storage track is intended for low-cost external storage and long-term preservation of digital work such as:

- images and photography;
- art and high-resolution work;
- music and audio;
- video;
- documents;
- creator collections;
- museum and archive collections;
- other digital cultural material.

VIA should remain a light management and presentation layer where practical. The underlying bytes should use suitable external, decentralized or durable storage rather than forcing VIA to operate heavy storage infrastructure itself.

## NFT minting relationship

NFT minting has a separate storage rule inside the mint flow:

- up to and including 5 MB can be offered free on the VIA platform side;
- above 5 MB, VIA cannot promise free storage;
- the creator should see the size threshold and any storage choice/cost before completing the mint;
- this rule does not turn VIA Storage into an NFT-only feature.

The exact provider, technical path, price calculation and settlement for files above the free threshold remain implementation decisions for the storage/minting build stage.

## Historical price inventory

Earlier VIA planning contains example one-time storage prices and larger museum/archive tiers. These figures are inventory, not final production tariffs. They must be rechecked against actual provider costs, durability, exchange rates, legal obligations and VIA's small service margin before activation.

Historical examples include packages around 10 MB, 50 MB, 100 MB, 500 MB and larger GB/TB museum/archive tiers.

## Design rules

- Show real storage cost clearly before payment.
- Keep ordinary VIA use free; charge only where storage creates a real external cost or optional service value.
- Avoid subscriptions when a responsible one-time durable-storage model is technically and economically possible.
- Do not promise literal eternal storage or unsupported legal archive compliance.
- Preserve content hashes and useful metadata where the selected storage model supports it.
- Avoid dependence on one fragile VIA-owned media server.
- Keep museum/archive scale possible without forcing the ordinary creator into institutional pricing.

## Build status

This document records the existing VIA Storage track so it is not lost while other VIA tracks are built in parallel. Provider selection, current prices, upload limits, payment handling and production claims must be verified before the module becomes live.
