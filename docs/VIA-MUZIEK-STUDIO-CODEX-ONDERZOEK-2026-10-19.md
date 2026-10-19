# VIA-MUZIEK STUDIO — onderzoeksdossier voor Codex
Datum: 2026-10-19. **Documentatie, geen toestemming tot implementatie, betaling, merge of productie.**

## Besluitkader gebruiker
VIA-MUZIEK: schakelen tussen **Eenvoudig** en **Professioneel** met lage, nog te valideren gebruiksprijzen; studio in beeldschermvorm voor influencers, radiomakers, podcasters, schrijvers en muzikanten. Vraag-en-aanbod tussen opdrachtgevers en makers; DeSo Identity als enige accountlogin, geen nieuwe loginprovider. VIA moet zijn eigen platformkosten dekken; eventuele kosten voor opslag/uitzenden niet stilzwijgend op VIA afwentelen. DeSo krijgt activiteit en normale netwerktransacties; een aparte afdracht aan DeSo is **niet** besloten. Radiopagina heeft klassieke en futuristische VIA-MUZIEK-uitvoering, eigen account-NFT of eigen afbeelding als omslag. DeSo NFT eigendom controleren per actuele account. Bestaande radio niet vervangen.

## Bronplatforms en integratieadvies (bezoek bron/licentie opnieuw vóór codekopie)
| Bron | URL | Mogelijkheid | Licentie / risico | Codex-advies |
|---|---|---|---|---|
| AudioMass | https://github.com/pkalogiros/AudioMass | Browser audio-editor, opname, multitrack, export | MIT voor eigen code; third-party notices en encoderlicenties controleren | **P1** eenvoudige studio, minimale integratie onderzoeken |
| SoundCraft | https://github.com/storytold/soundcraft | Browser multitrack DAW in Rust, uitgebreide mengpaneel-UI | MIT of Apache-2.0, third-party notices; pre-alpha en browserbelasting | **P1** professioneel, eerst haalbaarheids-/performanceproef |
| EchoLab | https://github.com/M5Devs/EchoLab | React/Web Audio opname, EQ, effecten, lokaal project | MIT, maar Firebase Auth/Firestore/Storage en AI-cloudfuncties niet overnemen | P2 losse technieken als reserve |
| openDAW | https://github.com/lesgreys/opendaw | TypeScript browser DAW | AGPL-3 netwerkverplichtingen of commerciële licentie; incompatibiliteit mogelijk | Alleen onderzoek, **geen code overnemen** zonder licentieanalyse |
| AzuraCast | https://www.azuracast.com/docs/ | WebDJ, AutoDJ, playlists, Icecast, live radiostation | AGPL-3, Docker/VPS en luisterbandbreedte kosten | Architectuurreferentie; niet op Vercel serverless installeren |
| Icecast | https://icecast.org/docs/ | Zelfgehoste radiostreams | Server/bandbreedte vereist | Pas bij bewezen financiering en toestemming |
| LiveKit | https://docs.livekit.io/transport/self-hosting/ | WebRTC gasten, realtime audio/video | Self-hosted SFU + ingress/egress/Redis en CPU/bandbreedte | Later, **niet** in gratis MVP |

## Technische basis
Browser Web Audio API, MediaRecorder, OfflineAudioContext, IndexedDB, File System Access waar ondersteund; detecteer features en geef fallback op Safari/iOS. Geen opslag op VIA-servers: export lokaal of expliciet naar eigen gekozen leverancier met zichtbare kosten. Grote projecten kunnen browseropslag/quota/geheugen overschrijden; autosave + herstel + duidelijke waarschuwing vóór afsluiten. Geen auteursrechtelijk beschermde samples zonder licentie. Eigen UI in VIA-stijl, geen logo/merk van bronplatform als VIA-merk.

## Gefaseerde bouwroute — elke stap apart ter beoordeling
1. **Audit**: zoek bestaande VIA-studio, radio, NFT, opslag, Identity, DeSo transacties, marketplace en audio-componenten; maak aanwezig/ontbreekt/werkt-testmatrix; geen dubbel systeem.
2. **Prototype Eenvoudig**: 1 microfoon, import, waveform, knippen, volume, luisteren, lokaal exporteren; geen backend, geen betaling; iPhone/iPad/Android/desktop performanceproef.
3. **Professioneel**: meerdere sporen, mixer, mute/solo, EQ, effecten, undo, save/herstel, export. Lazy-load zware modules; niet alle professionele code op gewone radiopagina laden.
4. **Account en rechten**: DeSo Identity 3.4.1 en bestaande sessie; publieke demo zonder login; betaalde sessie alleen met ingelogde DeSo-account en controleerbare toegang; accountwisseling veilig. Geen eigen Identity.
5. **Kosten**: onderzoek bestaande DeSo SDK betaalmethoden, wallet-transacties, fees, idempotentie, annulering/refund, bewijs van succesvolle on-chain betaling. Geen toegang ontgrendelen op basis van een client-only vlag of gesimuleerde betaling. Bereken totale kosten inclusief Vercel, data, opslag, auteursrechten, belastingen en support.
6. **Vraag & aanbod**: DeSo-profielen/posts/associaties als bron; opdrachten en aanbiedingen transparant, geen zelfbedachte escrow of gegarandeerde betaling. Moderatie en geschillenproces uitwerken.
7. **Live later**: kostenmodel per gelijktijdige studio, luisteraars, minuten, bitrate en gastverbinding. Licenties/muziekrechten en moderatie vooraf regelen. Geen onbeperkt live voor $1 beloven.

## Prijzen: hypotheses, geen tarieven
Eenvoudig 30 minuten $1, Professioneel 30 minuten $2 zijn **alleen rekenvoorbeelden**. Een studio in de browser kan technisch meerdere onafhankelijke gebruikers tegelijk bedienen omdat verwerking op hun apparaten plaatsvindt. Dit is geen gegarandeerde capaciteit of omzet. Vergelijk marktprijzen pas met dezelfde functionaliteit, licentie, opslag, live-bandbreedte en btw. Kosten niet dubbel aan maker doorbelasten zonder voorafgaande duidelijkheid.

## Bestaande radio en visuele afwerking
Bestaande `app/radio/page.tsx`, `app/radio/radio-browser.tsx`, `app/via-global-radio.tsx`, `app/api/via/radio/route.ts`. Draft PR's #1483 (uitleg), #1484 (globale speler), #1485 (foutmelding), #1486 (vertalingen); nog niet samengevoegd. Klassieke radio en futuristische radio als verwisselbare lichte illustraties, opschrift **VIA-MUZIEK**. Eigen NFT alleen van actuele DeSo-account: `/api/v0/get-nfts-for-user`; geen NFT-mint of blockchaintransactie voor kiezen omslag. Externe afbeelding alleen veilige URL/upload volgens bestaande opslagregels en auteursrechten.

## Acceptatie en risico's
- Geen extra betaalde infrastructuur of node zonder akkoord; open source is niet gelijk aan gratis exploitatie.
- DeSo heeft geen automatische inkomsten uit alleen een DeSo-login; netwerkkosten en aanvullende app fees zijn verschillende zaken.
- Test op echte apparaten, browsers, PWA-standalone; toegankelijkheid, contrast, knoppen, iPad breedte, batterijverbruik, offline/herstel, grote audiobestanden.
- Elke PR één gerichte wijziging, niet op main; beide Vercel-previews zelfde SHA groen; geen merge zonder expliciete toestemming.
- Eerst een kosten- en licentierapport met exacte dependencies, compatibiliteit en voorgestelde kleine PR's; pas daarna implementatie.

## Primaire referenties
- https://github.com/pkalogiros/AudioMass/blob/production/LICENSE
- https://github.com/storytold/soundcraft
- https://github.com/M5Devs/EchoLab
- https://github.com/lesgreys/opendaw
- https://www.azuracast.com/docs/
- https://docs.livekit.io/transport/self-hosting/ingress/
- https://docs.livekit.io/transport/self-hosting/egress/
- https://docs.deso.org/deso-identity/identity/concepts
- https://docs.deso.org/deso-backend/construct-transactions
- https://docs.deso.org/deso-backend/api/nft-endpoints
