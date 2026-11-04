# VIA hervatten — 1 november 2026

Gebruiker wil om 16:05 verder; wacht op zijn bericht. Geen verdere toestemmingvragen: wijzigingen en testen zijn geautoriseerd. Niet automatisch financiële transacties versturen. Geen subagents gevraagd.

## Werkplek en behoud
Actuele repository staat op SamsungLaptop:
C:\Users\peter\Documents\Codex\2026-10-21\kijk-op-github\work\nft-laptop-preview
Branch: fix/postoffice-nft-release-20261101.
Commits: 8a9bb9d4 (grote vorige wijziging); a4c84995 (homepage accountnaam).
Deze repository bevat 37 eerdere lokale commits boven origin/main. NIET vervangen door oude Github/cloud checkout.
next.config.mjs heeft bestaande machine-specifieke wijziging, NIET deployen/stagen.
Geen gegevens verwijderen bij compacter maken. Aanmelding is door gebruiker bevestigd als WERKEND. Die intact houden.

## Huidige runtime
http://127.0.0.1:3041 draait productiebuild van VOOR onderstaande checkpointwijzigingen, Desktop Commander sessie PID 37360.
Dev 3045 sessie PID 7024 kan nog lopen. Niet tegelijk met .next build testen.
Start-Process kinderen sterven bij tool-einde; server via Desktop Commander start_process direct starten.
Laatste build home-profile-build.log was succesvol.
Actuele broncodecheckpoint wijzigingen hieronder nog NIET gebouwd/herstart of gepubliceerd.
Geen changes gepusht/nieuwe Vercel deployment gedaan in deze beurt.

## Nieuw bewezen / wijzigingen in deze checkpoint
1. Lege Following: node.deso.org get-posts-stateless timeout na 25s; EXACT dezelfde openbare aanvraag bij https://desocialworld.com leverde 5 posts in 617ms.
   NFT read bij DSW 201ms; canonical 7649ms. Bewijs work/public-nodes-probe.log.
   app/deso-api.ts nu beperkte read-only fallback voor get-posts-stateless, get-nfts-for-user, get-nft-showcase.
   Geen financiële writes/signing/notificationmetadata naar fallback! Following eerste timeout 5s, showcase15s.
   Nog live UI en volledige NFT-paginering via fallback testen. Broncode, geen actieve build.
2. DiamondButton had async hasPermissions() zonder await: Promise altijd truthy, permissionaanvraag overgeslagen.
   Nu await toegevoegd. Statusmeldingen in iconvariant niet meer sr-only maar zichtbaar.
   Nog regressiontest met geweigerde/toegestane permission, accountwissel en mock signing toevoegen.
   Geen echte diamantbetaling door agent verstuurd.
3. Hoofdnav Market verwijderd op expliciet verzoek; Marktplaats blijft binnen NFT subnav.
4. Live pagina overbodige terugknop ← VIA verwijderd.

## Gebruikersfeedback NIET vergeten; grotendeels nog open
- Profielblad te lang: bovenstuk compact, cover begrenzen en onderste bio/gegevens vanaf regel onder de naam/statistieken inklapbaar. Referentie DeSocialWorld screenshot.
- Onder avatar/naam: coinprijs, followers, following, Days on DeSo, FR, vrijwillig openbaar land en bestaande links ontbreken/deels ontbreken. Alleen brongegevens gebruiken, niets verzinnen.
- Creatorcoinprijs moet in DESO EN actuele USD/EUR via DESOkoers zichtbaar, geen vaste dollarprijs.
- Profiel bestaande coinPriceDeSoNanos, creatorBasisPoints, holders, coinsInCirculation beschikbaar maar niet allemaal gerenderd.
- lib/via/deso-profile-read.ts volledige profielread Promise.all faalt geheel als optionele follow/activity read gooit: fouttoleranter maken zonder verzonnen nulwaarden.
- Naam van afzender en 'Gepost via VIA' ook bij eigen profielposts en ontvangen notificatiepost weergeven.
  In public-posts.tsx staan auteur en ViaClient===viadeso.online al; niet elke render heeft deze metadata.
  Profile OwnPost type heeft nog geen publicKey/username/postExtraData; eigen naam is beschikbaar via sessieprofiel.
- Postvak onder Postkantoor blijft leeg/503; dit is prioriteit boven cosmetiek. Niet claimen klaar op basis van fixtures.
- Diamanten kunnen op VIA niet bevestigd worden, op DSW wel; received notification screenshot @Dirham gaf OuwePiet1 diamond.
  Eigen post kan geen diamant naar zichzelf, maar replies van anderen wel.
- Notifications sidebar bestaande historische bezoekerscijfers bewaren. Volledige Live/Visitors/Activity/Community behouden.
  Gebruiker stond expliciet eigen-site meetpunten toe wanneer externe meetpunten ontbreken. Nog implementeren!
  LIVE placeholders en Trends waren verkeerd verwijderd, zijn inmiddels in bron hersteld.
  Oude bezoekersdata Vercel API: today1, month0, year372; niets wissen/niets verzinnen.
- Mint te veel tekst en gemengde NL/EN. Compact, uitleg inklapbaar, juiste vertaling in HELE pagina, niet alleen mint-nft root.
  MintPreflightLocalizer richt zich alleen op #mint-nft, daardoor titel/media/terms buiten root niet vertaald.
  Actief account key wordt automatisch gebruikt; dropdown toont lange key terwijl naam onderaan staat. Naam+avatar als primaire aanduiding, key onder details. Niet gebruiker key opnieuw laten invullen.
- NFT's /collection en /collection/mine gaven user generic errorboundary: nog niet gereproduceerd als JS crash.
  diagnose-review.cjs browser met testsessie en publieke OuwePietkey gaf in English en Dutch geen pageerror, NFTs later wel geladen.
  Logs work/review-diagnosis*.log. Browser extra404 Vercel insights lokaal,400 onchainfixturekey en image NotSameOrigin.
  Niet afdoen als alleen upstream; inspecteer volledige log en normale/cacheddata scenario; screenshot user is bewijs.
- Knop Markt hoort NIET hoofdnav. Nu brongecorrigeerd.
- Knop ← VIA hoort NIET op Live (dubbele home). Nu brongecorrigeerd.
- Nog open vorige feedback: markt conveyor echte showcase, geen NFTz knoppen in VIA, collectie naam/@naam/key lookup, maker en ontvanger/claimer naam BEIDE tonen, claim accountgroepering, compacter NFTguide, headerNFTactive.
  Veel daarvan vorige commit geimplementeerd, live nog verifiëren. Geen bronposts/links van anderen stilzwijgend wijzigen.

## Verificatie en eerlijkheid
Vorige 271 unittests pass en eerdere browserfixtures Hot/Following/Recent/readmore/diamonds stable/6flags/video pass. Dit bewijst NIET echte DeSo feed/login/financiële diamondactie.
Aanmelding werkt volgens gebruiker; echte compact profilename OuwePiet API200 in847ms bevestigd.
Echte following vóór fallback503 in24s.
Huidige checkpoint typecheck/test logs: work/review-checkpoint-typecheck.log en review-checkpoint-tests.log.
Nieuw src checkpoint nog niet gebuild, niet live bewezen, geen nieuwe productiepublicatie.
Bewaar notes en wijzigingen in Git.

## Tools
Desktop Commander is verbonden, device2cd66192-b8cf-452c-b272-d03c7528c16b.
Tools remote_desktop_commander_start_process/read_process_output/read_file/write_file.
PowerShell; rg niet geïnstalleerd -> Select-String/Get-ChildItem. Lees geen secrets/seed data.
Voor scripts schrijf .cjs en execute; vermijd node-e PS quoting en nested backticks in functions.exec.
Playwright: NODE_PATH C:\Users\peter\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules, chromium channel msedge headless.
Vercel project lumen-3z, team_TOFpvpjr3iW9OEttFIgbBiE2, prj_jIlAxdTGhCmndxGodXwgS5Zj7r97, OuwePiet/Lumen.
www.viadeso.online / viadeso.online. Geen deployment gedaan; eerst echte reviewflow bewijzen.

## Eerstvolgend bij start
1. Controleer Gitcheckpoint en teststatus; voeg fallback/diamondregressies toe.
2. Build en herstart3041, echte Followingfeed + NFTcollection/cursor en foutscenario testen.
3. Profilecompact en coin/metadata, Minttaal en accountnaam.
4. Eigenanalytics respectvol zonder fictieve historischewaarden.
5. Pas dan push/preview/publicatie van concrete geteste versie; geen nieuwe toestemmingvraag nodig.
