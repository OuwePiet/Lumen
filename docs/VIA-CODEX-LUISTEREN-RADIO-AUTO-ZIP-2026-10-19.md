# VIA — Codex overdracht: luisterbibliotheek, Wereldradio, VIA-auto en ZIP-voorraad
Datum: 19 oktober 2026. Status: DOCUMENTATIE / VOORBEREIDING, geen opdracht tot implementeren, mergen of deployen.

## Directe aanleiding en bron
Gebruiker leverde `via-platform.zip` aan (lokale mapnaam `/home/workdir/artifacts/via-platform/`) als **dringende aanvullende informatie op verzoek van Codex**. De ZIP is in de chatsessie bekeken. Dit is referentiemateriaal, niet de te installeren architectuur. Behoud ZIP als bron; geen ongevraagde kopie in productierepo.

ZIP bevat `README.md`, `package.json`, `public/index.html`, `public/js/app.js`, `public/css/style.css`, `server-pure.js`, `server/index.js`, `server/routes/{upload,payments}.js`, `server/utils/{splits,storage}.js`. README noemt DeSo-mock, lokale uploads, opslagroutering, vooraf/achteraf kostenoverzicht, gesimuleerde transfers, en 88/12 creator/VIA-verdeling. **Die verdeling is niet goedgekeurd**; geen percentage uit ZIP overnemen. Betalingen, upload en accountkoppeling zijn demonstratie, geen werkelijke providerbetalingen of blockchaintransacties. Geen Express-server, eigen backend, lokale opslag, in-memory betaaladministratie of nepbevestigingen naar productie kopiëren.

## Bestaande VIA-code eerst hergebruiken
Repository `OuwePiet/Lumen`: `app/radio/page.tsx` toont Wereldradio via `RadioBrowser`; `app/via-global-radio.tsx` bevat een gedeelde radio-afspeelcomponent, stationselectie, HTTPS-streamvalidatie en meertalige labels (NL/EN/FR/ES/CN/Hindi). Controleer daarnaast bestaande luisterbibliotheek-/media-/wallet-/NFT-/DeSo-modules voordat nieuwe componenten worden voorgesteld. Het bestaan van code bewijst nog niet dat alle functies werken.

## Luisterbibliotheek — afmaken, geen dubbel platform
Bestaande afspraken voor auteurs, voorlezers, luisterboeken, muziek en kunstenaars terughalen uit masterregister en code. Afspelen/voorlezen, informatie over maker en duur, duidelijke rechten/toestemming, kosteloze toegankelijkheid waar van toepassing. Voor betaalde content: alleen reeds goedgekeurde DeSo-/externe betaalroutes, transparant vooraf/achteraf overzicht en opslagprovider rechtstreeks door gebruiker betaald. VIA betaalt geen opslag; geen nieuwe betaalprovider, percentage of eigen kasstroom zonder aparte besluitvorming. Onderzoek ZIP-ideeën als UX-referentie voor uploadstappen, kostenoverzicht en foutafhandeling.

## VIA-Wereldradio — bestaande implementatie afmaken
Gebruik bestaande Wereldradio en globale speler, geen nieuwe radio-app. Test afspelen, pauzeren, stationwissel, terugkeren tussen VIA-pagina's, onderbrekingen, mobiele browsers en PWA-standalone. HTTPS-streams en rechten controleren; geen garantie dat achtergrondgeluid op elk OS doorloopt. In VIA-auto: uitsluitend veilige spraakopdrachten voor bestaande radiofuncties, voor zover browser/OS dit kosteloos toestaat.

## VIA-auto — vastgelegde beperkingen
Onderdeel van dezelfde gratis VIA-PWA, geen tweede platform. Alleen spraakbediening; GEEN berichten verzenden; GEEN betalingen, biedingen, aankopen of andere transacties. Ontvangen meldingen/berichten alleen op verzoek laten voorlezen waar technisch mogelijk. Foto's/afbeeldingen standaard verborgen; uitsluitend zichtbaar wanneer de gebruiker **vooraf buiten automodus** voorkeur heeft aangevinkt, en nooit als dit rijden onveilig maakt. Talen: zoveel als gratis apparaatfuncties ondersteunen; vertaling alleen als kosteloos, met fallback op oorspronkelijke taal. Eerste gebruik: duidelijke veiligheidswaarschuwing met actieve gelezen/begrijp-bevestiging; juridische aansprakelijkheidsuitsluiting niet als absoluut geldig presenteren. Geen veronderstelde betrouwbare bewegingsdetectie. CarPlay/Android Auto niet claimen zonder afzonderlijk platformonderzoek; PWA alleen geeft geen CarPlay/Android Auto-app. Geen betaalde spraak- of AI-diensten.

## VIA-PWA en merk
Bestaande `app/manifest.ts`, `app/layout.tsx`, `app/apple-icon.tsx`. Concept PR #1482 voor stabiele manifest-ID: https://github.com/OuwePiet/Lumen/pull/1482. Opstartscherm: exact origineel VIA-blaadje waarin VIA al leesbaar staat; **geen tweede woord VIA**; daaronder leesbaar `viadeso.online`; vervolgens automatisch openbare homepage. DeSo-login alleen waar nodig, bestaande geldige sessie hergebruiken. iPhone/iPad/Android telefoon en tablet. Gratis installatie buiten App Store/Play Store. Pushmeldingen gewenst mits werkelijk zonder extra kosten en met toestemming; onderzoek technische haalbaarheid, niet beloven.

## Concrete Codex-checklist vóór uitvoering
1. Vergelijk ZIP-voorraad per module met bestaande code; tabel: herbruikbaar idee / reeds aanwezig / ontbreekt / onveilig of ongeschikt.
2. Breng echte DeSo Identity, opslagproviders, rechten, kosten en betaalstromen in kaart. Geen simulatie presenteren als echt.
3. Maak testmatrix Wereldradio, luisterbibliotheek, PWA en VIA-auto voor iPhone/iPad/Android en desktop; onderscheid browserbeperkingen van codefouten.
4. Onderzoek gratis spraak- en vertaalvoorzieningen, autoplay- en achtergrondbeperkingen, en push zonder betaalde infrastructuur.
5. Geef voorstel met kleine afzonderlijke PR's en kostenindicatie **nul extra verplicht**; geen nieuwe services zonder akkoord.
6. Bewaak bestaande afspraken: DeSo is bron van waarheid, geen duplicaten, geen productiecode/merge/deploy zonder expliciete toestemming; beide Vercels op identieke SHA groen vóór eventuele merge.

## Relatie tot eerdere documenten
Lees `docs/VIA-MASTERREGISTER-2026-10-18.md` en `docs/VIA-NFT-EXTERNE-OPSLAG-VIEWER-2026-10-19.md` op branch `docs/via-masterregister-20261018`. Geen tweede DeSo360, alleen compatibele NFT-mediaviewer voor externe opslag.

## Uitvoering Wereldradio 19 oktober — expliciete keuze 1, 2, 3 en 5
Gebruiker gaf toestemming voor punten 1 (zichtbare globale speler), 2 (vertalingen), 3 (streamfouten) en 5 (voorbereiding VIA-auto). Punt 4 (apparaatproeven) is NIET aangevraagd. Losse draft PR's: #1484 zichtbare bediening; #1485 streamfoutmelding; #1486 aanvullende vertalingen. PR #1483 bevat paginauitleg. Geen van deze PR's is geaccepteerd of gemerged. #1484 en #1485 wijzigen hetzelfde bestand en moeten gecontroleerd in volgorde geïntegreerd worden.

Voor VIA-auto (punt 5) uitsluitend integratievoorbereiding: bestaande globale radio events `via:world-radio:station`, `via:world-radio:play`, `via:world-radio:pause` en geselecteerde station in `via:world-radio:station` (localStorage) hergebruiken. Spraakcommando's radio aan, radio uit, kies station alleen via gratis OS/browser mogelijkheden en expliciete gebruikersactie; niet beloven dat handsfree wake word of continue achtergrondspraak op iOS PWA mogelijk is. Nooit een tweede audioplayer of radio-backend maken. Geen nieuwe server, geen kosten, geen code voor VIA-auto zonder aparte gecontroleerde PR. 
