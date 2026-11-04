# Uitzoekwerk voor een aparte chat — VIA / DeSo

Onderzoek alleen openbare documentatie en API-antwoorden. Geen toegang tot mijn account, geen signing, geen betalingen, geen publicatie. Geef per antwoord concrete bronlinks en request/responsevoorbeelden. Maak onderscheid tussen bevestigd en vermoedelijk.

## 1. Followingfeed — hoogste prioriteit
Op 1 november 2026 gaf POST https://node.deso.org/api/v0/get-posts-stateless na25seconden timeout. Exact dezelfde read bij https://desocialworld.com/api/v0/get-posts-stateless leverde5posts in617ms.
Body:
{ "GetPostsForFollowFeed": true, "ReaderPublicKeyBase58Check": "<openbare DeSo public key>", "NumToFetch": 5, "FetchSubcomments": false, "MediaRequired": false }
Onderzoek actuele contract, paginering, sortering en betrouwbare publieke nodefallback. Welke gegevens zijn node-lokaal en mogen niet worden gemengd? Hoe detecteer je upstreamfouten zonder een leeg postvak als succes te tonen?

## 2. NFT eigendom en showcase
Verifieer actuele get-nfts-for-user Limit/LastKeyHex/NFTsMap, inclusief meerdere edities van hetzelfde werk, inclusieve cursor en mempool. Niet aannemen dat een willekeurige node dezelfde paginering ondersteunt.
Verifieer get-nft-showcase NFTCollections/NumCopiesForSale/LowestBuyNowPriceNanos. Welke informatie is daadwerkelijk beschikbaar voor een eigen VIA marktplaats met native DeSo verkoop en biedingen?
Geen NFTz/externe koopknoppen nodig.

## 3. Diamanten / deso-protocol SDK3.4.1
VIA heeft een async adapter hasPermissions(). Een ontbrekende await is al in bron gerepareerd.
Onderzoek correcte minimale permissions voor send-diamonds/BASIC_TRANSFER, GlobalDESOLimit semantiek, quote SpendAmountNanos/FeeNanos, hoger niveau op eerder gegeven diamond, en foutafhandeling zonder dubbele verzending.
Geef voorstel voor tests met mocks; voer geen echte transactie uit.
Hoe onderscheid je voorbereidingsfout, geweigerde toestemming, signingfout, submitfout en geslaagde submit met mislukte naverificatie?

## 4. Profielgegevens en muntprijs
Welke openbare bronnen leveren betrouwbaar: accountaanmaak/dagen op DeSo, followers/following, founder reward/FR, creatorcoinprijs in DESO, vrijwillig gepubliceerd land, links uit profiel ExtraData?
USD/EUR prijs = coinprijs in DESOnanos /1e9 * actuele DESOkoers. Bevestig precieze veldnamen en eenheden. Geen land afleiden uit taal/IP/gedrag. Geen ontbrekende waarden verzinnen.
Hoe tonen we afzendernaam en clientherkomst (ViaClient=viadeso.online) consistent in feed, eigen profielposts, reacties en notificatiepost?

## 5. Eigen VIA meetpunten
Ontwerp eenvoudige eigen-site metingen voor actieve sessies, aangemelde sessies, gasten, trends en eerste VIA posts.
Bestaande historische Vercelbezoekerscijfers behouden. Nieuwe meetpunten alleen vanaf startdatum tellen. Geen fictieve historische aanvulling of gelijkstelling van browsersessies aan unieke personen.
Bestaande private @vercel/blob opslag is beschikbaar. Onderzoek concurrency/ETag, kosten van heartbeatwrites, retentie, minimale gegevens en aggregatie. Geef ook aan welke metriek beter een database/KV nodig heeft.

Lever een kort praktisch advies met bronverwijzingen; geen complete herbouw.
