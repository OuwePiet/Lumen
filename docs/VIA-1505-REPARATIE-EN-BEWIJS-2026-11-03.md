# Issue #1505 — informatietoren, herstel en testgrenzen

Bronnen:
- https://github.com/OuwePiet/Lumen/issues/1505
- https://github.com/OuwePiet/Lumen/issues/1444#issuecomment-6612457347

Werkbranch: fix/via-information-tower-1505-20261103, gebaseerd op main99d47540.
De bestaande uitgebreide laptoptestbranch is afzonderlijk bewaard op b23d090f.
Geen wijzigingen aan Identity, signing, NFT-acties, fees of historische opslag.

## Wat is hersteld
- Alle vier panelen en bestaande velden blijven behouden.
- Toren ook zichtbaar onder de meldingen op telefoon/tablet; desktop houdt de rechterkolom.
- Bezoekers en recente VIA-activiteit verversen bij mount, focus, pageshow, online en zichtbaar-tab-interval.
- Requests per component worden gededupliceerd; bezoekers minimaal300s, activiteit minimaal60s, handmatig minimaal5s.
- Server deelt gelijktijdige bezoekersqueries en bewaart resultaten300s; mislukte queries krijgen60s rust per serverproces.
- Geheime Vercel-token blijft alleen op server. Geen tokenkopie naar preview of browser.
- Analytics-aanvraag bevat nu zowel projectId als teamId.
- Landentellingen worden NOOIT als unieke bezoekers bij elkaar opgeteld.
- Pageviews worden NOOIT als bezoekers ingevuld. Nul blijft nul; ontbrekend of strijdig is onbekend.
- Een mislukte deelbron gooit andere geldige cijfers niet weg.
- Openbare laatste geldige snapshots blijven in de tab bewaard bij bronuitval en herladen; bewaartermijn maximaal7dagen.
- Dag/maandcijfers uit een vorig UTC-venster worden niet als huidige waarden getoond.
- Bron, UTC-venster, meet-/bijwerktijd, steekproefstatus en fouten zichtbaar; zes bestaande talen.
- Trends zijn uitsluitend hashtagfrequenties binnen de beschreven VIA-steekproef, geen wereldwijde trends.
- Recente VIA-makers komen uitsluitend uit diezelfde steekproef, geen verzonnen eerste-postclaims.
- Geen database, eigen node, betaalde dienst, heartbeatopslag of extra gebruikersidentificatie toegevoegd.

## Werkelijke bronblokkade — NIET gereed claimen
3nov2026, gecontroleerde Vercel-productielog:
GET /api/via/analytics/visitors:
[VIA analytics] Upstream request failed { status:403, errorCode:'forbidden' }.
De productie-API antwoordde503 ANALYTICS_SOURCE_UNAVAILABLE.
De gekoppelde Vercel-connector kon Web Analytics evenmin opvragen:404 Web Analytics not found (projectID én projectnaam getest).
Hieruit volgt NIET dat er nul bezoekers zijn. Het bewijst ook nog niet of tokenrechten, analyticsconfiguratie of API-beschikbaarheid de precieze externe oorzaak is.
De nieuwe team-scope in de aanvraag is technisch getest, maar de echte productietoken is niet uitgelezen, gekopieerd of vervangen.
Toegang tot de echte bron moet aantoonbaar werken voordat betrouwbare live-bezoekersaantallen als afgerond gelden.

## Betekenis en resterende meetgrenzen
- 'Bezoekers in de laatste5minuten' is een tijdvenster van de bezoekersbron, GEEN bewijs van actuele live-aanwezigheid.
- DeSo-accounts versus gasten: bestaande analytics levert geen betrouwbare verdeling naar aanmeldstatus. Veld blijft zichtbaar met uitleg dat de meetbron ontbreekt. Geen account-/IP-tracking verzonnen.
- 'Welcome / First Post': een steekproef van30recente posts kan de eerste post ooit niet aantonen. Veld blijft zichtbaar en wordt niet met recentste post verward.
- Activiteitstrends en makers zijn een STEEKPROEF, geen platformtotalen.
- Deze PR sluit issue1505 daarom niet automatisch en maakt geen productieclaim.

## Verificatie
- TypeScript en Next-productiebuild uitgevoerd op Windows.
- Unittests omvatten onbekend/nul, geen pageviewvervanging, landenconflict, maandconflict,403, gedeeltelijke bronuitval, behoud historisch totaal, deduplicatie/cooldown en onbekend landenschema.
- Browsertest: EN/NL/FR/ES/ZH/HI ×390/1024/1536px, alle panelen zichtbaar, geen horizontale overflow, focusdeduplicatie, foutstatus en behoud getal na uitval/herladen.
- Browsergegevens zijn TESTFIXTURES. Dit bewijst geen echte bezoekersmeting.
- Windows Edge headless gebruikt; geen claim van fysieke iPhone/iPad-acceptatie.
- Lokale Turbopack-root is alleen nodig vanwege node_modules-junction op deze laptop; die machineconfig wordt niet gecommit.
- Preview/PR-status en exacte SHA apart controleren. Geen automatische merge of productie-deployment.
