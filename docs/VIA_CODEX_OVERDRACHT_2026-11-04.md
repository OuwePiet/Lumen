# VIA — Codex overdracht en uitvoeringsvolgorde (4 november 2026)

**Status: voorbereid, NIET gestart.** Documentatiebranch `docs/via-codex-overdracht-20261104`. Geen codewijzigingen, merge, productie-uitrol of toestemming voor financiële transacties.

## Harde afspraken
- Maak eerst bestaande VIA-functies af; pas daarna nieuwe functies. Bestaande VIA-vormgeving en zes talen behouden. Test iPhone, iPad (liggend), Windows-laptop en bezoekersmodus.
- Gebruik officiële DeSo Identity 3.4.1 met consistente accountbinding in prepare → permission → sign → submit → confirm. Geen nieuwe wallet, eigen DeSo-node, eigen handelsledger, onnodige toestemmingsvensters of verborgen betalingen.
- @DeSoMunt is een spaarpot, **geen** nieuw VIA-token. Makers betalen externe opslag zelf; VIA betaalt niet vooruit.
- Geen code-merge of productie-uitrol zonder afzonderlijk akkoord, tests en twee vereiste Vercel READY-controles op dezelfde commit. Geen echte blockchainhandelingen tijdens voorbereiding.
- Meet Vercel Runtime Cache-kosten vóór 10 december 2026.

## Uitvoeringsvolgorde (bestaande GitHub-issues)
1. **P0 #1444:** read-only baseline: main SHA, open PR's, CI, builds, beide Vercel-projecten, complete scherm-/knoppenmatrix (werkt/defect/onbewezen), iPhone/iPad/laptop. Bewijs, root causes en kleinste herstelvolgorde. Niet zomaar nieuwe functies bouwen.
2. **P0 #1432 + #1452:** DeSo Identity 3.4.1, legacy-versus-modern signing, async `hasPermissions()` correct awaiten, accountwissel, afwijzing/annulering, verlopen sessie, dubbele submit. Decodeer ongetekende Like-transactie voordat 0.00005 DESO als fee of betaling wordt bestempeld. Diamantlevels en kosten uitsluitend DeSo-bron.
3. **P0/P1 #1444:** Postkantoor (Following/feed, post/reply/quote/repost, meerdere media, vertalen, emoji, diamonds), notificaties en berichten, navigatie. Controleer node-fallback en timeouts zonder data te verzinnen.
4. **P1 #1505:** rechter informatietoren: bron, definitie, tijdvenster, unieke bezoekers versus bezoeken, update bij focus, privacy en begrensde verversing. Geen sample als totaal presenteren.
5. **P1 #1499:** Marketplace uit accountcontrole-laadlus; openbare browsemodus, zoeken, filteren, NFT-detail, edities en biedingen. Login pas bij echte acties.
6. **P1 #1498:** compacte NFT Studio in vier stappen; centraal uitklapbaar handboek; alle kosten en voorwaarden zichtbaar op beslismoment. DeSo mint-, bied-, accept-, transfer- en royaltyroutes per editie controleren.
7. **P1 NFTz/3D binnen bestaande NFT-issues:** herstel historische DeSo 3D-NFT metadata en laad echte GLB/glTF vanuit extern archief, met veilige browser-only viewer. Geen eigen extractieserver.
8. **P2 #1507 + #1493:** bestaande Bibliotheek, LuisterHoek, radio, opname, AI, vertaling en mediabewerking inventariseren en pas na toestemming gefaseerd aansluiten.
9. **P2 #1497, #1496:** Spellen compact, schermvullend per apparaat; Saved/Bookmarks werkend, vertalingen en dubbele knoppen.
10. **P2 #1511 + #1509:** Wereldkalender, 11-11, Carnaval, Oud/Nieuw, iPad-beheer, publieke vindbaarheid en Vercel-kosten. #1506/#1508/#1510/#1514 zijn onderzoek/toekomst, geen bouwstart.

## NFT/Marketplace: data- en acceptatiecontract
- `get-single-post`: `PostFound.PostExtraData`.
- `get-nfts-created-by-public-key` = creaties; `get-nfts-for-user` = bezit; niet verwarren. Controleer `NFTsMap`, `Limit`, `LastKeyHex` en paginering tegen actuele node.
- `get-nft-collection-summary` en `get-nft-entries-for-nft-post`: collectie en afzonderlijke serienummers.
- `get-nft-bids-for-nft-post`, `get-nft-bids-for-user`: actieve biedingen; `create-nft-bid` (bod 0 voor intrekken, na actuele verificatie), `accept-nft-bid`, `transfer-nft`, `accept-nft-transfer`, `update-nft` zijn on-chain handelingen via officiële Identity.
- Sales alleen bevestigde verkopen; geen biedingen als omzet tonen. Royalties en eventuele VIA-fee uitsluitend volgens bestaande goedgekeurde regels en actuele DeSo-gegevens.
- Elk scherm moet loading/empty/error/timeout/cancel/account-switch afhandelen; geen transacties zonder expliciete actie.

## Historische NFTz / 3DeSocial: concrete herstelproef
- Broncode: https://github.com/3DeSocial/3d-nft-viewer-npm
- Voorbeeld-posthash: `0b88277db8b3ddac74537b3f5b10897865e0fea5edcc47c86547a36fd5cf6693`
- Voorbeeld-preview: https://images.deso.org/746201e0167a8176c3c0ca2b141b4ed2c92442a1d16a55ab999a558e8a831a28.gif
- Historische `backend/NFTReader.js` leest `PostFound.PostExtraData['3DExtraData']` als JSON, `3DModels[0].ModelUrl` als externe ZIP, zoekt `.glb` en anders `.gltf`. **Let op:** de oude backend kan bij een mislukte download `success:true, modelUrl:null` retourneren. Niet overnemen.
- Herstel: vraag post live read-only op, valideer werkelijke metadata, toets NFT-edities, controleer externe URL/Arweave-ID, HTTP/CORS/MIME/limieten/hash; browser-only veilig uitpakken (ZIP-slip/decompression bomb/remote resources afweren), Three.js GLTFLoader met relatieve textures; iPhone/iPad/laptop testen. Bij fout 2D-preview tonen.
- **Nog onbewezen:** live ModelUrl, nog bereikbare 3D-ZIP en geslaagde render. Nooit als gereed rapporteren zonder bewijs.

## Arweave: kosten- en veiligheidsgrenzen
- Eerste route: maker betaalt en uploadt zelf via eigen opslagaccount, VIA valideert de aangeleverde ID/URL en bestand vóór DeSo-mint. Later eventueel directe Turbo-browserintegratie uitsluitend na apart besluit.
- Geen VIA-custody, private keys, automatische uploads of voorschot. Kosten vóór bevestiging: opslag, netwerk, provider, eventuele goedgekeurde VIA-vergoeding.
- Testnet is niet definitieve opslag; controleer terugleesbaarheid, contenthash, bevestiging, CORS en gateway-fallback. Openbare URL is niet privé.
- Externe opslag en DeSo mint zijn twee afzonderlijke stappen; nooit dubbel betalen of minten bij timeout.

## Overige onderdelen
- Richards-Gallery: toestemming/scope controleren, makerportfolio los van huidig bezit, gedeelde 3D-viewer.
- LuisterHoek: radio/muziek/podcasts/luisterboeken; bestaande speler, licenties, iOS-afspeelbeperkingen en hervatten.
- Opnamestudio: lokale opname/preview/export onderzoeken; nooit automatisch posten.
- Bibliotheek: EPUB/PDF/audio, rechten, toegangscontrole en externe opslag.
- AI NFT: opt-in, lokale/gratis mogelijkheden eerst; geen betaalde provider zonder besluit; altijd menselijke bevestiging.
- Wereldkalender: automatische tijdzoneberekening, 11 november, Carnaval, jaarwisseling en kostenbewuste updates.
- Toekomst: andere blockchains, WorldNews Paper, WordPress voorlopig geparkeerd.

## Verplicht opleverbewijs per Codex-PR
1. Bestaande bestanden en aantoonbare root cause; geen dubbele implementatie.
2. Minimale wijziging, duidelijke scope, regressie- en financiële risico's.
3. Geautomatiseerde tests + echte browser/device-teststatus; screenshots.
4. PR-link, exacte head SHA, twee READY-controles, expliciet wat onbewezen blijft.
5. **Wachten op toestemming vóór merge/deploy**; daarna producties op dezelfde SHA verifiëren.

## Startinstructie (nog NIET uitvoeren)
'Lees dit dossier en #1444, #1432, #1452, #1498, #1499, #1505. Begin met read-only baseline en defectenmatrix; rapporteer huidige main SHA, open PR's, CI, beide Vercel-projecten, code-inventaris en eerste kleinste P0-fixvoorstel. Geen merge, deploy, betaling of ondertekening zonder apart akkoord.'

Bronnen: https://docs.deso.org/ · https://github.com/3DeSocial/3d-nft-viewer-npm · https://threejs.org/docs/#examples/en/loaders/GLTFLoader
