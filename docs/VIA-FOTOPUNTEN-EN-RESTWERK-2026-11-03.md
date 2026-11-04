# VIA — fotopunten en resterende reparaties

Deze lijst vervangt geen eigenaaracceptatie. De screenshots uit de chat blijven leidend. Een geslaagde bouw betekent niet dat alle reparaties af zijn. Hoofdopdracht #1444 blijft open; testplatform in concept-PR #1513, losse torenreparatie #1512. Productie is niet aangepast.

## Foto’s en concrete meldingen

| Fotopunt / melding | Gedaan in testbranch | Nog te bewijzen of te herstellen |
|---|---|---|
| Profiel te hoog; informatie onder naam ontbreekt | Compactere cover, bio en extra gegevens inklapbaar; FR, followers/following, muntprijs en live DeSo-omrekening; gerichte browsercontrole | Dagen op DeSo, land en alle brongebonden badges alleen met betrouwbare bron; vergelijking op fysieke laptop/iPad |
| Centrale aanmelding verliest naam/account | Bestaande SDK behouden, naam in kop en mint-accountselectie; eigenaar heeft aanmelding eerder werkend bevestigd | Volledige A/B/refresh/logout-controle op eigen apparaten; iPhone redirect |
| Postkantoor heeft geen posts | Publieke readfallback, echte Following-read gaf 30 posts; bedienings- en mediafixtures gecontroleerd | Feed en paginering met echte aangemelde eigenaar; externe bronuitval kan blijven optreden |
| Diamanten niet bevestigbaar; knoppen springen | Async-toestemming afgewacht, bestaande locks/receipts/accountguards gebruikt; mockscenario’s en layout gecontroleerd | Echte gecontroleerde eigenaarstransactie; multitab en volledige A/B-acceptatie; #1452 blijft open |
| Wie verstuurt / VIA-bron ontbreekt | Auteur en broncomponent toegevoegd aan eigen posts, meldingen en publieke/nested posts uit #1502 | Iedere echte post-/replycontext vergelijken; originele tekst van makers niet als UI-reclame verwijderen |
| Lees verder, flags, ontvangen video’s | Gerichte browserfixtures voor lees verder, vlaggen, videoweergave en actierij | Echte ontvangen media en iPhone/iPad |
| Dubbele Home/Markt/terug-VIA-knoppen | Hoofdknop Markt en Live-terugknop verwijderd; meldingenkop gecorrigeerd | Alle schermbreedtes en toetsenbordnavigatie op fysieke apparaten |
| Toren: bezoekers/landen/activiteit behouden | Vier panelen; bron/tijdvenster/UTC/foutstatus; begrensde refresh; geldige publieke momentopname blijft bij fout/herlaad; 6 talen × 3 breedtes | Productiebron geeft 403 forbidden, route 503. Preview mist analyticsconfiguratie. Gasten/DeSo-accounts/echte eerste-posttelling missen meetbron |
| Collectie: ruim, key in plaats van naam, foutpagina | Compactere kop/bediening; één taalkeuze; dubbele DOM-/React-vertaling hersteld; echte publieke NFT-read eerder zichtbaar | Alle kaarten: maker versus eigenaar, namen, royalties, cache/bronuitval en alle NFT-transacties |
| Mint: gemengde taal, veel tekst, naam/key | Compactere onderdelen, accountnaam en key secundair; NL-media/accountcontrole en 6-talige navigatie | Vier volledige stappen, alle inhoud/fouten in zes talen, kostenoverzicht en echte eigenaar-mint |
| Claim/Giveaway: veel ruimte, accountnamen | Bestaande campagne- en eigendomslogica behouden, NFT-tab actief | Maker én ontvanger/claimer per campagne en per account volledig controleren; compacte eindcontrole |
| NFTz/DeSoMarket-voorbeelden en ontbrekende markt | Publieke markt blokkeert niet op Identity; pending transfers niet als listing; bestaande royalties behouden | Volledige aankoop/bod/verkoop/transfer/accept/withdraw en edities, bron- en prijsinformatie, geen verouderde externe UI-verwijzingen |
| Homepage, Discover, handboek/muziek te ruim of niet aangesloten | Bestaande compactere homepage en navigatie behouden | Discover-aansluiting en alle gids-/muziekroutes inhoudelijk en op screenshots nalopen |
| Wereldkalender/versieringen 11 november en carnaval | Jaarlijks 11/11 en Sint-Maarten afzonderlijk, regionale kalenderfilter, Carnaval op Pasen−49/−48/−47 en Aswoensdag−46; zes talen; maskers/lampionnen/confetti; dagelijkse actualisatie zonder servertaak | Browsercontrole en fysieke acceptatie; lokale/Braziliaanse evenementen niet als universele datum voorstellen. #1511 blijft een afzonderlijk onderzoeksissue voor kosten/iPad-beheer |
| Saved en Wereldradio | Saved in zes talen, compacter en duidelijke browserlokale betekenis; verwijdering leest actuele opslag, updates via tabs. Radio-PR #1484 en #1485 gecombineerd: zichtbare enkele speler en vertaalde streamfout; oude zoekresultaten overschrijven nieuwe zoekopdracht niet | Browsercontrole; echte zendergeluidsweergave afhankelijk van apparaat/stream; geen accountcloudsync claimen |

## Alle 18 werkonderdelen: resterende acceptatie

1. Identity: accountwissels en redirects op fysieke apparaten.
2. Diamanten: echte eigenaarstransactie en financiële acceptatie.
3. Postkantoor: echte volledige lees-/schrijfcyclus, media en paginering.
4. Meldingen/DM: ongelezen, mark-read, accountisolatie en encryptie/verzenden; niet als af verklaard.
5. On-chain: alle fout-/annuleringspaden en kosten, geen dubbele verzending; unlockable-blokkades behouden.
6. Marketplace: bronuitval, serials/paginering en echte listings.
7. Studio: vier stappen, volledige vertaling en eigenaar-mint.
8. NFT-afdeling: created/owned en biedingen/verkoop/transfers volledig.
9. Saved: browserlokale werking expliciet, behoud/persist/refresh testen; geen nieuwe synchronisatiedienst.
10. Spellen: bestaande spellen per spel testen, compactheid/taal/toetsenbord; geen Genesis-nieuwbouw.
11. Radio/LuisterHoek: zoeken/favorieten/spelerfouten/navigation; echte streams fysiek testen. LuisterHoek niet als gebouwd claimen.
12. Kalender: nieuwe regionale vieringen en versieringen testen; kosten/iPad-beheer uit #1511 is onderzoek, geen nieuwe beheerpublicatie bouwen.
13. Toren: analyticsbron-toegang/configuratie herstellen; ontbrekende meetpunten onderbouwen.
14. Home/profiel/nav: fotovergelijking en resterende betrouwbare profielvelden.
15. Talen/toegankelijkheid: volledige tekst/fouten/keyboard in zes talen blijft groter dan de gerichte tests.
16. SEO: openbare canonical/sitemap/metadata en uitsluiting privépagina’s; indexering nooit alleen uit HTTP200 afleiden.
17. VIA-auto: uitsluitend bestaand concept onderzoeken; geen CarPlay/AndroidAuto-claim.
18. Infrastructuur/PWA: installatie op apparaten, bronstatus, toegang/secrets/kosten; geen nieuwe database/node/betaalde dienst.

## Betrouwbare grenzen

Er zijn geen echte betalingen, mints, diamond-verzendingen of DM-verzendingen door Codex uitgevoerd. Geen productie-merge/deployment. Browserfixtures en schermbreedtes zijn geen fysieke iPhone/iPad-acceptatie. Open opdrachten blijven open zolang dit bewijs ontbreekt.
