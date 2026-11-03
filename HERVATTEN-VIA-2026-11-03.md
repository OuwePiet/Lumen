# Hervatten VIA — 3 november 2026

## Werkplek en branches

Windows SamsungLaptop, repository work/nft-laptop-preview. Actieve branch fix/postoffice-nft-release-20261101. Concept-PR https://github.com/OuwePiet/Lumen/pull/1513 bevat de bestaande NFT-keten en alle geïntegreerde reparaties. Applicatiecode laatst gebouwd/getest op 090d498b; latere commit bevat alleen bewijsnotities/testselector.

Afzonderlijke kleine torenbranch: work/via-tower-1505-20261103, fix/via-information-tower-1505-20261103, e00ae969; concept-PR https://github.com/OuwePiet/Lumen/pull/1512. Niet blind vervangen door main of een oude branch. Main 99d47540 is niet gewijzigd.

## Exacte testversie

https://lumen-3z-elknp7n3b-beleggerpiet-4479s-projects.vercel.app
Vercel-project lumen-3z; deployment dpl_Ea5wCWTguiqiML4x7LS9rit4LCCz; applicatiecommit 090d498b; READY en kalenderroute HTTP200 bevestigd. Dit is een preview, productie viadeso.online is niet aangepast.

Lokaal: http://127.0.0.1:3041, Next-productieserver PID29520 op moment opslaan. Bouw vernieuwen vereist daarna de server herstarten; bouw en actieve server niet als dezelfde versie aannemen. De oudere aparte torenserver op3046 bevat niet het hele platform.

## Bewijs

295 unit tests en Next-productiebouw geslaagd. Toren zes talen × drie breedtes; collectie zes talen/terugwisselen/herladen; profiel/muntprijs/auteur/bron; mint-accountnaam en NL-media; publieke markt en PWA-id gericht gecontroleerd. Nieuw: kalender/Saved zes talen × drie breedtes, 2027-carnavalsdata, 11/11-versiering en datumwisseling; Saved opslaan/herladen/verwijderen/actuele lijst/tweede tab; één radiospeler met aan/uit/navigatie/foutmelding. Radiomedia zijn gesimuleerd, geen fysieke apparaatacceptatie of echte financiële transactie.

Zie docs/VIA-TESTPLATFORM-2026-11-03.md voor exacte logs en beperkingen. Screenshots blijven lokaal in outputs/. De oorspronkelijke eigenaarfoto’s staan in deze chat; niet verzinnen dat ze automatisch lokaal zijn gedownload.

## Wat nog open is

Lees als eerste docs/VIA-FOTOPUNTEN-EN-RESTWERK-2026-11-03.md: per foto/melding gedaan versus open, plus alle18 onderdelen. Daarna docs/VIA-1444-WERKSTAAT-2026-11-03.md (historische intake), docs/VIA-1444-BRONNOTITIES-2026-11-03.md (alle66comments) en docs/VIA-TESTBRANCH-VERGELIJKING-2026-11-03.md.

Bezoekersbron: productieupstream HTTP403 forbidden; publieke route503. Preview mist analyticsconfiguratie en meldt ANALYTICS_NOT_CONFIGURED. Geen token gekopieerd of instelling gewijzigd; geen bezoekerscijfers verzinnen. Gasten, online DeSo-accounts en echte eerste-postmeting hebben geen bewezen meetbron.

Echte eigenaaracceptatie voor accountwissels/redirects, posten/reacties/DM/encryptie, diamanten en alle NFT-transacties blijft nodig. Nog niet bewezen: alle profielvelden/badges, elke kaartnaam/maker/eigenaar, volledige Studio-vierstappen/zes talen, claim-maker én ontvanger, Discover/gids/muziek, alle spellen, SEO/privacyroutecontrole en installatie op apparaten. VIA-auto en kalenderkosten/iPad-beheer (#1511) blijven onderzoek; geen nieuwe infrastructuur bouwen.

## Grenzen

Geen automatische merge of productie-deployment. Niets alleen op basis van een build als AF verklaren of issues sluiten. Geen nieuwe database, node, betaalde API of cloudopslag. Geen transacties of berichten naar anderen uitvoeren zonder expliciete opdracht.

next.config.mjs heeft een ongecommitteerde lokale Turbopack-root voor de Windows node_modules-junction. Niet pushen. outputs/ is lokaal testbewijs, niet automatisch uploaden. Bestaande opgeslagen browsergegevens en de reservekopie work/VIA-checkpoint-20261101.zip niet wissen.
