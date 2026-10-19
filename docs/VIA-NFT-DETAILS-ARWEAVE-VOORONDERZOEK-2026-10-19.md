# VIA — NFT Details & Original Storage
**Vooronderzoek en ontwikkelspecificatie voor Codex — 19 oktober 2026**

**Status:** ontwerp/onderzoeksopdracht, niet gebouwd of getest.
**Samen lezen met:** `docs/VIA-MASTERREGISTER-2026-10-18.md` op branch `docs/via-masterregister-20261018`.
**Belangrijk:** dit document is geen toestemming voor codewijzigingen, PR's, merges, deployments of productiehandelingen. Codex onderzoekt eerst bestaande code en rapporteert bevindingen; uitvoering pas na afzonderlijke toestemming van de gebruiker.

## 1. Doel en afbakening
VIA ontwikkelt een zelfstandige, gebruiksvriendelijke functie voor het bekijken van NFT's, originele media en hun verifieerbare DeSo- en eventuele Arweave-transacties. DeSo360 is slechts een visuele inspiratiebron (kaart/detail-weergave); VIA mag niet afhankelijk worden van DeSo360 of diens creator-groep. Een geüploade afbeelding, een DeSo-post en een geminte NFT zijn drie verschillende zaken.

## 2. Bestaande VIA-afspraken blijven leidend
- DeSo is de bron van waarheid voor NFT-eigendom, posts, biedingen, transacties en royalties.
- DeSo Identity verzorgt accountkeuze, toestemming en ondertekening. Geen seed phrases of eigen VIA-goedkeuringssysteem.
- Arweave is voorkeursoptie voor externe permanente opslag, naast eerder besproken DeSo/IPFS/link-opties waar ondersteund.
- Gebruiker betaalt eventuele externe opslagkosten; VIA draagt geen opslagkosten. Geen verborgen betalingen.
- Bestaande NFT's zonder Arweave-koppeling blijven volledig leesbaar.
- Hergebruik bestaande VIA/DeSo-code; geen dubbele subsystemen.
- Mobiel (iPhone), iPad en laptop moeten werken; geen horizontale overflow.
- Alle bestaande NFT-mint-, bied-, koop-, verkoop-, claim-, transfer-, royalties- en walletafspraken blijven ongewijzigd totdat expliciet anders overeengekomen.

## 3. Functioneel ontwerp
### 3.1 Kaartenweergave
Toon thumbnail, titel, maker, editie/serienummer waar beschikbaar, eigenaar en status. De gebruiker kan schakelen tussen **Kaarten** en **Details**.

### 3.2 Detailsweergave
Toon uitsluitend daadwerkelijk beschikbare of aantoonbaar afleidbare gegevens:
- NFTPostHashHex / DeSo-post-hash en link naar oorspronkelijke post;
- serienummer, totaal aantal exemplaren, creator en huidige eigenaar;
- koop-/verkoopstatus, biedingen, Buy Now en royalties indien aanwezig;
- DeSo-voorbeeldmedia en oorspronkelijke mediareferentie;
- opslagprovider (DeSo, Arweave, IPFS, externe URL of onbekend);
- Arweave-transactie-ID en verifieerbare link indien aanwezig;
- bestandstype, afmetingen en bestandsgrootte indien betrouwbaar bekend;
- eventueel metadata en trefwoorden als die daadwerkelijk zijn vastgelegd.
Onbekend betekent 'Niet beschikbaar', nooit verzonnen waarden. Een opslagtransactie bewijst niet automatisch auteursrecht of NFT-eigendom.

### 3.3 Mijn afbeeldingen (apart van NFT's)
Onderzoek of bestaande via VIA gepubliceerde media via DeSo-posts teruggevonden kunnen worden. Scheid gewone afbeeldingen expliciet van geminte NFT's. Geen claim dat historische media altijd een origineel in hoge resolutie hebben.

### 3.4 Origineel bekijken
Open de verifieerbare originele mediareferentie veilig; geef bron/provider aan. Geen onveilige HTML-embeds of automatisch uitvoeren van externe inhoud.

## 4. Gewenste toekomstige upload/mintflow
1. Maker kiest bestand; VIA toont type, grootte en afmetingen.
2. Maker kiest beschikbare opslagoptie; VIA toont concrete kosten vóór bevestiging.
3. Maker geeft afzonderlijk toestemming voor betaalde externe opslag.
4. VIA bewaakt uploadresultaat en de teruggegeven opslagreferentie.
5. Postcreatie en NFT-mint volgen uitsluitend het geldende DeSo-protocol en de bestaande Identity-autorisatie.
6. Toon upload, post en NFT-transactie als afzonderlijke statussen; voorkom dubbele kosten, dubbele mint en ongewenste herpogingen.
7. Leg alleen compatibele metadata vast; verifieer vooraf hoe latere terugvindbaarheid gegarandeerd wordt.

## 5. Onderzoekspunten voor Codex
1. Inventariseer huidige NFT-pagina's, componenten, types, endpoints, opslagvelden en reeds afgeronde NFT-PR's in OuwePiet/Lumen.
2. Controleer actuele DeSo-documentatie/API's voor NFT's, posthash, serienummers, eigendom, royalties, biedingen en mint.
3. Controleer of Arweave-referenties nu al in posts, NFT-metadata of bestaande VIA-opslagvelden staan; verzin geen DeSo-velden.
4. Onderzoek de koppeling preview op DeSo ↔ origineel op Arweave, inclusief verlies/ontbreken van metadata.
5. Onderzoek rechtstreekse betaling door de maker aan opslagprovider, zonder VIA-kosten of centrale betaalverplichting.
6. Controleer media-/bestandsgroottegrenzen en externe-URL-beveiliging.
7. Bepaal welke schermonderdelen zonder nieuwe backend mogelijk zijn.
8. Lever een gap-analyse met per functie: reeds aanwezig / deels aanwezig / ontbreekt / afhankelijkheid / bewijs (bestanden, tests, PR's).

## 6. Presentatiemodel (geen blockchainstandaard)
Mogelijke UI-velden: `postHashHex`, `serialNumber`, `creatorPublicKey`, `ownerPublicKey`, `previewUrl`, `originalMediaUrl`, `storageProvider`, `arweaveTransactionId`, `mediaType`, `width`, `height`, `fileSize`, `isForSale`, `minBid`, `buyNowPrice`, `creatorRoyalty`, `coinRoyalty`, `verificationStatus`. Codex moet de werkelijke API-veldnamen en herkomst verifiëren; geen nieuwe protocolvelden aannemen.

## 7. UX en veiligheid
- iPhone: één kolom, volledig binnen scherm, duidelijk bedienbare/sluitbare details.
- iPad: overzichtelijke kaarten en details; laptop: meerkoloms overzicht.
- Toon kopieerbare transactiereferenties en externe links met duidelijke labels.
- Geen seed phrases, geen eigen signing, geen onveilige embeds, geen 'geverifieerd origineel' zonder bewijs.
- Onbetrouwbare media en URLs veilig behandelen; rekening houden met mislukte uploads en onbereikbare gateways.

## 8. Verificatie- en testmatrix
1. Bestaande DeSo-NFT zonder Arweave.
2. NFT met aantoonbare Arweave-referentie.
3. Ongeldige/onbereikbare Arweave-referentie.
4. Meerdere NFT-exemplaren.
5. Verkoop, biedingen, Buy Now en royalties.
6. Gewone postafbeelding die geen NFT is.
7. Mislukte/afgebroken upload.
8. Geen dubbele betaling, dubbele mint of dubbele verzending.
9. Correcte Identity-accountbinding bij accountwissel.
10. iPhone, iPad, laptop, schermbreedte en toegankelijke bediening.

## 9. Gewenste oplevering aan gebruiker
**Eerst uitsluitend onderzoeksrapport** met bestandsverwijzingen, bestaande functies, ontbrekende functies, architectuurvoorstel, opslagkostenmodel, risico's en voorgestelde kleine PR-stappen. Geen implementatie zonder nieuwe expliciete toestemming. Als later toestemming volgt: één wijziging per PR, beide Vercel-omgevingen exact dezelfde SHA groen vóór merge en productie uitsluitend na akkoord.

## 10. Documentatiebronnen (technisch te herverifiëren)
- https://docs.deso.org/deso-backend/api/nft-endpoints
- https://docs.deso.org/deso-backend/construct-transactions/nft-transactions-api
- https://docs.deso.org/deso-backend/transaction-utilities
- https://docs.ar.io/build/guides/storing-nfts
- https://docs.arweave.net/apis

**Aantekening:** DeSo360-voorbeeld is een door gebruiker gedeelde screenshot, geen bevestiging dat de betreffende functie open source is of dat de beschreven opslagflow één-op-één kopieerbaar is. Ontwerp onafhankelijk.
