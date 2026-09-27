# VIA handbook — NFT media, storage and resilience

Status: working handbook note — 27 September 2026

## Principle
VIA keeps native DeSo minting as the standard path, while creators retain control of their original media and can choose additional storage or backup routes. VIA does not require its own blockchain or node.

## What is stored where
A native DeSo NFT consists of DeSo post/NFT/transaction data plus a media reference. The original image, video, audio or other source file is a separate asset. Creators should keep their own master copy.

## Creator master copy
The original can remain on the creator's iPad/iPhone, PC/Mac, SSD/HDD, NAS or other private storage. This is a backup/master and is not by itself a public media host.

## Public media choices
- Standard — DeSo media: the normal VIA/DeSo route.
- Protected — DeSo plus an additional decentralized/persistent backup when supported.
- Advanced — creator chooses a supported external/IPFS provider, own server, or an existing durable media URL.
- Permanent storage can later be offered as a premium option after provider, price and reliability review.

IPFS availability depends on persistent pinning/storage; VIA must not depend on one public IPFS gateway.

## Wallets
Wallets such as MetaMask belong under wallet/payment/Web3 connectivity, not under NFT media storage. A wallet may help authorize or pay for external Web3 services but is not itself the storage location for large NFT media files.

## Mint flow
Preferred native flow:
1. Choose media.
2. Choose public media/storage route.
3. Create the DeSo post and obtain its PostHash.
4. Set copies, royalties, sale/bid/Buy Now and unlockable terms where supported.
5. VIA requests the live DeSo constructor quote.
6. Creator reviews and approves through DeSo Identity.
7. VIA submits the native NFT transaction.
8. The NFT remains a DeSo post and NF.VIA displays the live NFT state and applicable Buy/Bid/Claim controls.

Existing DeSo NFTs are discovered from chain data and must not be reminted merely to import them into VIA.

## External creators
NF.VIA is intended to support creators who did not arrive through an existing DeSo frontend. They should receive the same native NFT result where technically possible, with a simple guided interface and a transparent VIA service fee plus actual network/storage/payment-provider costs. Exact fees must be shown from current data rather than hard-coded assumptions.

## Resilience
VIA should avoid a single point of failure in its media presentation. A failure of one frontend, media provider or public gateway should not erase the creator's master copy or the underlying native DeSo NFT record. VIA cannot guarantee survival of the DeSo network itself and must not describe local backup as public hosting.

## Discover
Discover/search may surface creators, NFT posts and NF.VIA mint entry points. Search visibility must not depend on one competing DeSo frontend.

## UI language
Keep storage choices understandable:
- Standard — DeSo
- Protected — DeSo + decentralized backup
- Advanced — choose storage

Technical provider details can be shown behind an explanation/details control rather than forcing them on every creator.
