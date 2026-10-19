# VIA NFT — externe opslag en media-viewer (besluit 19 oktober 2026)

## Status en bron
Informatie- en onderzoeksnotitie voor Codex; geen opdracht om code te wijzigen, PR's te mergen of te deployen. Gebaseerd op door de eigenaar getoonde schermafbeeldingen van DeSo360 (19 oktober 2026) en diens expliciete afbakening.

## Vaststaand besluit
VIA bouwt **geen tweede DeSo360** binnen de NFT-pagina's. DeSo360 is uitsluitend een referentie/informatiebron. VIA neemt het **view-gedeelte** op voor NFT's waarvan de media extern zijn opgeslagen. Denk aan geschikte externe afbeeldingen, panorama's en 360°-beelden, afhankelijk van formaat en browserondersteuning. De viewer hoort in de bestaande NFT-detailervaring en moet op iPhone, iPad en laptop bruikbaar zijn.

## Opslag- en betaalproces
- De NFT-eigenaar/maker kiest een externe opslagdienst (zoals Arweave of IPFS via een concrete aanbieder).
- VIA begeleidt de handelingen van begin tot eind: bestands-/formaatcontrole, voorbereiden, aanbieden aan opslag, betaalmogelijkheden tonen, gebruiker zelf laten afrekenen bij de opslagaanbieder, resultaat/URI/transactie-ID verifiëren, media koppelen aan DeSo NFT-gegevens en daarna bekijken in VIA.
- **De gebruiker betaalt de opslagdienst rechtstreeks. VIA betaalt of financiert geen opslag namens gebruikers.**
- Onderzoek per aanbieder of rechtstreeks betalen technisch kan, welke betaalmethoden beschikbaar zijn, hoe betaalbevestiging veilig terugkomt en wat te doen bij onderbreking/mislukking. Geen fictieve automatische integratie of garantie.
- VIA kan een **kleine, vooraf duidelijk vermelde vergoeding** vragen voor werkelijk geleverde diensten/handelingen rond het opslagproces. Scheid VIA-fee, externe opslagkosten en eventuele DeSo-netwerkkosten zichtbaar vóór bevestiging. Exact tarief nog niet vastgesteld.
- Geen onnodige VIA-backend, permanente hostingkosten of dubbele opslag introduceren.

## Afbakening
Niet overnemen: zelfstandige DeSo360-community, makersranglijsten, airdrops, wereldkaart, eigen fotoplatform, of betaald ontgrendelen van 12K/22K als apart DeSo360-verdienmodel. Een NFT-verkoop is niet hetzelfde als een betaalde high-res unlock. Geen dergelijke functionaliteit zonder apart besluit.

## Technisch vooronderzoek voor Codex
1. Inventariseer bestaande NFT-detail-, mint- en opslagcode; hergebruik bestaande DeSo Identity en DeSo NFT-functionaliteit.
2. Controleer bestandsformaten en metadata voor panorama/360°, normale afbeelding/video/3D; bied veilige fallback voor niet-ondersteunde media.
3. Vergelijk externe opslagproviders op rechtstreeks door de gebruiker te betalen transacties, kosten, permanence, URI-verificatie, CORS en toegang tot originele media.
4. Beschrijf een transparante stap-voor-stap UX voor iPhone, iPad en laptop, inclusief annuleren, hervatten, foutmeldingen en dubbele betaling voorkomen.
5. Ontwerp een veilige viewer met passende interactie en expliciete sensor-toestemming waar relevant; voorkom onbedoeld downloaden van enorme bestanden en toon laadtijden/datagebruik.
6. Leg een kostenmatrix en DeSo/Arweave/IPFS-verwijzingsmodel voor ter beoordeling vóór implementatie.

## Bronnen
Gebruikersscreenshots van deso360.com van 19 oktober 2026: viewer, sensors, galerij, Dashboard/My Images, Publish, Storage, Data en Unlock. De screenshots bewijzen getoonde UI, niet de achterliggende implementatie of externe kosten.

**Geen toestemming voor implementatie of productieaanpassing op basis van deze notitie.**
