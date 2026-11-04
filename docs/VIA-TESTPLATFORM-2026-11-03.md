# VIA — testplatform voor de volgende controle

Deze aangepaste versie staat op de bestaande testbranch `fix/postoffice-nft-release-20261101`, concept-PR #1513. De afzonderlijke torenreparatie staat in concept-PR #1512. Productie `viadeso.online` is niet bijgewerkt.

Vaste preview-ingang: https://lumen-3z-git-fix-postoffice-de3f93-beleggerpiet-4479s-projects.vercel.app

## Controlevolgorde

1. Collectie: één taalkeuze in de kop. Wissel Nederlands → Engels → Frans → Spaans → Chinees → Hindi → Nederlands. Herlaad; de gekozen taal blijft staan. De kop is compact.
2. Aanmelden: controleer accountnaam en avatar; wissel account en controleer profiel, Postkantoor en mint op dezelfde actieve naam.
3. Postkantoor: Following, Hot en Recent; lees verder; afspelen van video; auteur en VIA-bron bij een VIA-post. Een bronfout moet een zichtbare melding geven.
4. Profiel: compacte omslag; naam, volgers, gevolgd, FR en muntprijs; bio en extra gegevens openklappen.
5. NFT: publieke maker zoeken met naam of public key; eigen NFT's; publieke markt zonder login; mint toont accountnaam. Controleer kosten en opslag vóór een eventuele eigenaarstransactie.
6. Meldingen: vier torenpanelen blijven zichtbaar; op kleinere schermen onder de inhoud. Bron, meetperiode en verversstatus moeten duidelijk zijn.
7. Werelradio en PWA: bestaande routes en installatie-identiteit zijn behouden. Controleer afspelen op het eigen apparaat; browser- en streambeleid kunnen verschillen.

## Wat nog openstaat

De productiebron voor bezoekers antwoordt HTTP 403 forbidden; de productiebezoekersroute geeft 503. De preview heeft geen productie-analyticsconfiguratie en meldt ANALYTICS_NOT_CONFIGURED. Er worden geen bezoekcijfers verzonnen. Een eerdere geldige openbare momentopname blijft bij een tijdelijke fout in dezelfde browsersessie bewaard.

Gasten, aangemelde DeSo-accounts en een echte eerste-posttelling zijn zonder betrouwbare meetbron niet bewezen. Recente activiteit/trends zijn een begrensde steekproef van DeSo-posts, geen volledige historie.

Geen echte financiële transactie uitgevoerd door Codex. Fysieke iPhone/iPad-acceptatie en alle 18 onderdelen zijn niet afgerond. De centrale werkstaat blijft docs/VIA-1444-WERKSTAAT-2026-11-03.md. Geen merge of productie-deployment uitgevoerd.

## Vastgelegde controle van deze versie

- Next-productiebouw geslaagd; 290 unit tests geslaagd.
- Toren: zes talen × drie schermbreedtes geslaagd met expliciete bronfixtures; ook foutmelding, behoud van 372 bij een mislukte verversing/herlaad en deduplicatie bij twintig focusgebeurtenissen.
- Collectie: taalwissel via de echte centrale knop, alle zes talen en terug naar Nederlands, herladen, geen tweede NFT-taalkeuze en geen horizontale overflow bij 390/1024/1536 pixels. De bestaande DOM-vertaler slaat tekst over die al door React wordt vertaald.
- Lokale logs staan naast de werkmap: via-language-final-tests.log, via-language-final-build.log, via-integrated-tower-browser.log, via-integrated-language-browser.log en via-integrated-review-browser.log.
- Schermbeelden staan lokaal in outputs/VIA-testbewijs-20261103/. Deze bevatten de publieke testcollectie; geen browserauthenticatiestatus is opgeslagen.
- De door Vercel gebouwde preview van commit 2700b1cb is READY. De collectieroute antwoordt via geautoriseerde Vercel-toegang 200; de bronroute meldt correct 503/ANALYTICS_NOT_CONFIGURED.

De losse toren-PR is klein gehouden; de geïntegreerde test-PR bewaart ook de eerdere lokale NFT-geschiedenis. Beide blijven concepten en sluiten geen open opdracht automatisch af.

## Aanvulling: kalender, Saved en radio — applicatiecommit 090d498b

Geteste preview: https://lumen-3z-elknp7n3b-beleggerpiet-4479s-projects.vercel.app — Vercel READY, /wereldkalender geautoriseerd gecontroleerd met HTTP 200 en juiste deployment-id.

- 295 unit tests geslaagd; Next-productiebouw geslaagd.
- Kalender en Saved: zes talen × drie breedtes (390/1024/1536), geen React-pageerrors of horizontale overflow in deze controles.
- Vooruitgezette browserdatum: 11 november 2026 toont opening carnavalsseizoen én Sint-Maarten apart. Voor 2027 zijn carnavalszondag/maandag/dinsdag 7/8/9 februari en Aswoensdag 10 februari. Regionaal, geen universele wettelijke vrije dag; lokale/Braziliaanse evenementen kunnen afwijken.
- Homepage: maskers/lampionnen op 11/11, carnavalsversiering in de paasrelatieve periode; klikdoorgang en wissel van 11 naar 12 november gecontroleerd. Geen betaalde API, serverjob of geolocatie.
- Saved: opslaan vanuit een spel, een ondertussen toegevoegd item behouden bij verwijderen, herladen, verwijderen en actualiseren in tweede tab geslaagd. Bestaande browserlokale sleutel en opgeslagen lijst behouden; geen accountsync toegevoegd.
- Radio: bestaande reparaties #1484 en #1485 gecombineerd. Eén zichtbare speler, aan/uit, behoud bij navigatie en Nederlandstalige streamfout gecontroleerd. Media-API gesimuleerd: dit bewijst de bediening, niet echt hoorbaar zendergeluid.
- Logs naast werkmap: via-calendar-saved-radio-tests.log, via-calendar-saved-radio-build.log, via-calendar-saved-radio-browser.log (18 matrixchecks; eerste flowselectie te strikt) en via-calendar-saved-radio-flows.log (alle drie gecorrigeerde flows PASS). De foutieve testselector is hersteld in tests/via-calendar-saved-radio.browser.cjs.
- Schermbeelden lokaal: outputs/VIA-kalender-saved-radio-20261103/. Geen browserauthenticatiestatus opgeslagen.

Volledige fotopunten/restlijst: VIA-FOTOPUNTEN-EN-RESTWERK-2026-11-03.md. Niet alle reparaties zijn afgerond; echte financiële handelingen en fysieke iPhone/iPad-acceptatie ontbreken. Productie blijft ongewijzigd.
