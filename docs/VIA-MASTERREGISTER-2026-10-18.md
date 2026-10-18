# VIA — MASTERREGISTER PROJECTEN, MODULES EN VOORRAAD

**Peildatum:** 18 oktober 2026  
**Voor:** Codex  
**Platform:** https://viadeso.online  
**Repository:** OuwePiet/Lumen  
**Doel:** inventarisatie van bestaande, gebouwde, geteste, besproken, geparkeerde en geschrapte onderdelen, inclusief Fase 3.

> **ALLEEN DOCUMENTATIE — GEEN BOUWOPDRACHT.** Dit register geeft geen toestemming om code, productie, branches of bestaande gebruikersafspraken te wijzigen. Fase 3 blijft volledig geparkeerd. De stand van tests en acceptaties op 18 oktober moet Codex aanvullen met eigen bewijs. Historische vermeldingen zijn geen bewijs van live werking.

## Statuswoorden

- **LIVE**: productiepublicatie bevestigd.
- **GEBOUWD**: code of module aanwezig, niet per se live of volledig bruikbaar.
- **IN TEST**: preview, proefdraai of tests; exacte uitslag verifiëren.
- **GOEDGEKEURD**: expliciete acceptatie met bewijs.
- **UITGEWERKT**: ontwerp/afspraken beschikbaar.
- **GEDEELTELIJK**: nog niet volledig aangesloten.
- **GEPARKEERD**: bewaren, niet uitvoeren.
- **GESCHRAPT**: niet terugbrengen.
- **TE VERIFIËREN**: actuele toestand onvoldoende aangetoond.

## 1. Technische platformbasis

- Next.js App Router, React, TypeScript, Tailwind; Vercel, viadeso.online, GitHub OuwePiet/Lumen — **LIVE**.
- DeSo Identity SDK 3.4.1; centrale accountkeuze; meerdere accounts; één geldige DeSo-toestemming bij login; openbare bezoekersmodus — **GEBOUWD/LIVE, volledige apparaattests TE VERIFIËREN**.
- Mobiel, iPhone, iPad, laptop/desktop; responsieve schermbreedte; één gedeelde navigatie en taalkeuze — **GEDEELTELIJK**.
- Talen NL/EN/FR/ES/CN/Hindi; vlaggen, vertaling van berichten en pagina's — **GEDEELTELIJK**.
- DeSo als bron van waarheid; geen tweede VIA-identiteit, geen eigen private-message-opslag, geen onnodige betaalde infrastructuur — **VASTE AFSPRAAK**.
- Werkwijze: één gerichte wijziging per PR, beide Vercel-previews op identieke SHA controleren, daarna pas goedgekeurde merge; geen ongeautoriseerde productieaanpassing.

## 2. Homepage en navigatie

VIA-logo; accountmenu met avatar en gebruikersnaam; verificatierozen; homepageknoppen; klokbalk en NASA-wereldbol; taalvlaggen; Notifications-lamp; welkom en VIA-blaadjes; land-, dag-, makers- en berichtentellers; Sponsor VIA; Idea Box; externe opslag; AURA CARD; seizoensdecoratie; iPad/iPhone-opmaak. **LIVE/GEDEELTELIJK.**

Bekende PR's: #1463 (accountmenu, klok/NASA), #1466 (iPad-knoppen), #1472 (accountkeuze), #1473 (dubbel menu), #1475–#1477 (Identity, vinkjes, meldingslamp). Test iedere functie op echte apparaten voordat iets volledig goedgekeurd wordt genoemd.

## 3. Postkantoor / Social

Posten tot 5.000 tekens; afbeeldingen, video, YouTube; Following/Recent/Hot; laden; Reply, Repost, Quote, Like/emoji, Diamonds/Diamond Shower, Share, Save/Bookmarks, Follow/Unfollow, Translate en driepuntjesmenu; DeSo-profielen; „Gepost via VIA”; posten/reageren vanuit verschillende VIA-pagina's; NFT-verwijzingen. **GEBOUWD/IN TEST; werkelijke acties TE VERIFIËREN.**

PR's #1458–#1459 (sociale herstelacties), #1460–#1461 (Diamond-toestemming en dubbele verzending), #1480 (na login naar Postkantoor, feedbehoud en Diamonds).

## 4. Notifications

Likes, reacties, Diamonds, volgers, DeSo-activiteit; mobiele filters, aantallen en meldingslamp; accountgebonden ongelezenstatus; berichten openen; schermbreedte; DeSocialWorld als visuele/gedragsreferentie. **GEDEELTELIJK/IN TEST.** PR #1477 bevat meldingsherstel.

## 5. My Profile, Wallet en persoonlijke onderdelen

Profiel, avatar, cover, blauwe DeSo-verificatie, voorgesteld grijs inactiviteitsvinkje, VIA-blaadje, „Op DeSo sinds”; Posts, Gallery, Creator Coin, Diamonds, NFTs; Wallet en saldo; accountwissel; Creator Dashboard, Vault, Bookmarks/Saved, instellingen, beheerpagina. **GEDEELTELIJK/TE VERIFIËREN.**

## 6. NFT — bij Codex

Discover, Marketplace, Studio, Mint, My NFTs, Received NFTs, Received Bids, bieden, Buy Now, Accept/Withdraw Bid, Sale/Auction, Claim, Transfer, Burn, Set for Sale, Update Price, Unlockables, editions/collecties, maker- en coinroyalties, creator dashboard, NFT Vault, import, media repair/back-up; opslag DeSo/IPFS/HTTPS/Arweave; NFTz en DeSoMarket als referentie; image/video/audio/3D/embed; walletkeuze; sorteren/zoeken; openbare etalage; VIA-blaadje/watermerk; AI-afbeelding en NFT-mint; veilige transacties; afgesproken externe VIA-mintfee en zichtbare netwerk-/opslagkosten. **GEBOUWD/IN TEST, acceptatie per onderdeel verifiëren.**

PR's #1456 (collectie/navigatie), #1457 (DeSo-royalties), #1462 (bieden/Buy Now), #1478 (Identity), #1479 (opslagvoorbeeld), #1481 (navigatie/mintbedragen). **NFT-uitvoering uitsluitend bij Codex.**

## 7. Communities

Zes richtingen: **Art & Photography; Music; DeSo & Builders; NFT & Collecting; Games & Quest; Open Community.** Openbaar lezen; echte DeSo-berichten en reacties; eventuele Join/Leave, Mute/Block, Report en moderatie uitsluitend wanneer daadwerkelijk ondersteund. PR #142 basis; PR #785 verwijderde misleidende lokale schijnlidmaatschappen. **BASIS GEBOUWD, echte groepsfunctionaliteit OPEN.**

## 8. World Newspaper / Daily News

Bestaande /news-pagina met **World, Technology, DeSo & Crypto, Art & Culture, Music, Science**; landen en gebieden (ambitie circa 250), vlaggen, landenkeuze, actuele nieuwsbronnen, dagelijkse selectie, bronlinks, vertaling, samenvattingen, rustige homepageverwijzing/widget; scheiding van nieuws, community en sponsoring; minimale kosten. PR #139–#140 basis. **BASIS GEBOUWD; wereldwijde live nieuwsvoorziening OPEN.**

## 9. Wereldkalender

Dag/week/maand, tijdzones, seizoenen, wereldlanden, talen, herinneringen, nationale/culturele/religieuze feestdagen, Kerst, Pasen, Halloween, Dierendag, Pride/herdenkingsdagen, maanfeesten, nieuwjaarsanimatie, homepage-widget, mobiel. PR #1464–#1470: jaarwisseling, feestdagen, compacte navigatie, offline maanfeestdagen, sortering/toegankelijkheid en geïntegreerde proefversie. **EERDERE VERSIE LIVE; RECENTE AANVULLINGEN IN TEST/TE VERIFIËREN.**

## 10. Spellen / World Quest

VIA Daily Grid, Alphabet Relay, NEO PONG, Coffee Rush, Bean Drop, Perfect Blend, Blockchain Mosaic, World Quest; lokaal bewaren, delen, touchbediening, bezoekerstoegang. Extra besproken: legpuzzels, Rotate Rings, DeSo-ingelogde ingang. PR #148, #150, #153, #155, #157. **MEERDERE SPELLEN GEBOUWD; aanvullingen OPEN.**

## 11. Read, Luisterbibliotheek, Muziek en cultuur

Read & Stories; schrijvers, verhalen, boeken, voorlezers, audioboeken, luistertijd, auteursrechten en eventuele betaling; VIA Muziek, Music & Audio, Video & Film, Art & Painting, Photography, Museums & Heritage, Digital Museum, Artist Discovery, exposities en makers. PR #142 eerste Read-basis. **BASIS/UITGEWERKT/GEPARKEERD per onderdeel.**

## 12. VIA Live, radio en berichten

HTTPS-wereldradio, liveactiviteiten en ontmoetingen; privéberichten en mogelijke groepsgesprekken via officiële DeSo-encryptie; geen opslag van privéberichten door VIA; meldingen; Communities-koppeling; Discord apart geparkeerd. **RADIO DEELS AANWEZIG; OVERIGE WERKING TE VERIFIËREN.**

## 13. Discover, Wereld, Events, Learn en My VIA

Creators/gebruikers zoeken, live suggesties, landen/vlaggen, wereldklokken, Events, Learn, Idea Box, Saved, My VIA, AURA CARD, bezoekersstatistiek, wereld- en seizoensweergave. **DEELS GEBOUWD/UITGEWERKT.**

## 14. Sponsoring, tellers en betalingen

Sponsor VIA, sponsorvenster, sponsorcontent, DESO-betaling, transparante koers/fees, definitieve ontvangende account verifiëren (historisch OuwePiet/DeSoMunt), dubbele/onzekere submits voorkomen; creator-royalties, externe NFT-mintfee, opslagkosten rechtstreeks bij leverancier; geen onbedoelde VIA-kosten; tellers voor bezoekers/landen/makers/posts. PR #1474 beschermt sponsoring. **GEDEELTELIJK/FINANCIËLE TESTS TE VERIFIËREN.**

## 15. Handboek, veiligheid, ondersteuning en documentatie

Handboek VIA, Help, privacy, accountbinding, financiële signing, toestemming/budget, foutafhandeling, betrouwbaarheid van bronnen, vertaalbeleid, toegankelijke mobiele weergave, PR-register, bronregister, testprotocollen, oplevermatrix en overdrachten. Bekende documenten van 13 oktober: **VIA-Identity-Diamonds-uitvoering**, **VIA-MASTER-EINDRAPPORT**, **VIA-MASTER-OPLEVERMATRIX** (118 items), bronnenregister en historisch overzicht van 46 open PR's. **BESTAANDE DOCUMENTVOORRAAD; ACTUALISEREN MET BEWIJS.**

## 16. Historische Fase 1

Mobiel/tablet/desktop; Social en NFT; World Time; talen; royalties/editions; duurzame opslag; Creator Dashboard; Vault; veilige configuratie, headers, broncontrole, Vercel-build en read-only financiële aannames. **HISTORISCHE BASIS, huidige deelstatus afzonderlijk bepalen.**

## 17. Historische Fase 2

Checkout, Claim, Transfer, Burn, Update Price, Unlockables, Mint, Set for Sale, NFT-import, media repair/back-up, Creator Dashboard, Vault, testomgeving, internationale analytics, veilig signing- en betalingsproces. **DEELS GEBOUWD/IN TEST, met name NFT-werk bij Codex.**

## 18. FASE 3 — VOLLEDIG GEPARKEERD

**Expliciet parkeerbesluit: 17 september 2026. Niets hieronder activeren of uitvoeren zonder nieuw uitdrukkelijk besluit.**

### Infrastructuur en continuïteit
Eigen DeSo-nodes, vaste fallback-nodes, uitgebreide failover, eigen cache-architectuur, oude Lumen/VIA-sessiecache, automatische updates, automatische software-injectie, vergaande synchronisatie, scenario bij stoppen/veranderen van DeSo, VIA Archive en langetermijnbewaring.

### Wallets, identiteit en externe ketens
Historische cross-chain mapping, MetaMask, Phantom, externe wallets, alternatieve onboarding, passkeys/Web3Auth als toekomstige onderzoeksonderwerpen, nieuwe recoverymethoden, biometrische leeftijdscontrole.

### Financiële/NFT-uitbreidingen
Oude automatische veilingconcepten, checkout- en betalingsaannames, internationale betaalroutes, cross-chain transacties, aanvullende commerciële diensten, ongeteste automatische NFT-verwerking, verdere opslag-/herstelarchitectuur.

### Onveilige of niet-geverifieerde concepten — niet als functies presenteren
Silent derived-key signing, verborgen payment-bypasses, centrale platform-seed, seed-relays, onbeperkte derived keys in browseropslag, cross-chain mapping zonder expliciete toestemming, public-key-only beheerrechten, absolute hackvrijheid, juridische garanties, gegarandeerde synchronisatie binnen twee seconden, 100% uptime, volledig kopieerbestendige media. **GEPARKEERD, AFGEWEZEN OF ONVEILIG IN OORSPRONKELIJKE VORM.**

### Overige geparkeerde concepten
Eigen VIA-token, airdrops, invite-only standaardmodel, promotionele verificatie, Product Hunt/DApp-directorycampagnes, oude Supabase-/WhatsApp-aannames en andere historische Lumen/VERO/VIA-ideeën die niet veilig of passend zijn bevonden.

### Bronnen Fase 3
Masteraudit 8 september; oudere Lumen-, VERO- en VIA-documenten; broncontrole 6 september; inventarisatie 9 september; parkeerbesluit 17 september; latere overdrachts- en masterrapporten. **Dit overzicht moet tegen de oorspronkelijke bronnen worden vergeleken voordat het „volledig geverifieerd” mag heten.**

## 19. Overige besproken en geparkeerde voorraad

VIA Auto (spraak, niet bedienen tijdens rijden); VIA Monthly; VIA-app/PWA; VIA Archive; continuïteitsplan; VIA Muziek; openbare NFT Storefront; AI-afbeeldingen; DeSo-groepsgesprekken; Learn; Idea Box; VIA Live-uitbreidingen; digitale musea; Artist Discovery; Discord; reputatie/veiligheid; seizoensdecoratie; wereldkrantuitbreidingen. **GEPARKEERD/UITGEWERKT/DEELS AANWEZIG — GEEN NIEUWE UITVOERINGSOPDRACHT.**

## 20. Geschrapt

**Legendary Tales**: expliciet geschrapt in september 2026. Niet terugbrengen. Andere ideeën alleen als „geschrapt” markeren wanneer een aantoonbaar besluit bestaat.

## 21. Recente GitHub-werkvoorraad (laatst gecontroleerd 18 oktober)

- #1476 — ontbrekende Identity-productielogin; **gemerged 17 oktober**.
- #1477 — accountvinkjes, meldingslamp en mobiele meldingen; **gemerged 17 oktober**.
- #1478 — NFT en centrale Identity.
- #1479 — NFT-opslagflow.
- #1480 — Postkantoor na login, feed en Diamonds.
- #1481 — NFT-navigatie en mintbedragen.
- #1467–#1470 — Wereldkalender en geïntegreerde controles.
- #1460–#1462 — Diamonds en NFT-transactieveiligheid.
- #1474 — DESO-sponsoring.

**Niet-gemergede PR's zijn niet automatisch live of goedgekeurd.** Codex moet de laatste PR-status, SHA, Vercel-preview, testresultaten en gebruikersacceptaties van 18 oktober naast deze lijst leggen.

## 22. Bewijsregister per onderdeel

Vastleggen: modulenaam; codepad; bron/document; PR; commit-SHA; buildstatus; Vercel-preview; werkelijk uitgevoerde test; iPhone/iPad/laptop/desktop; expliciete goedkeuring en datum; productiestatus; resterende punten; geparkeerd/geschrapt. Geen percentages zonder meetbare grondslag.

## 23. Vaste grenzen

- Inventarisatie is **geen toestemming** voor codewijzigingen, merges of deploys.
- Fase 3 blijft **geparkeerd**; Legendary Tales blijft **geschrapt**.
- NFT-uitvoering blijft bij Codex.
- Geen tweede DeSo Identity of eigen private-message-server.
- Geen dubbele of onveilige financiële flows.
- Geen ongemerkte betaalde API's of infrastructuur.
- Eerder goedgekeurd werk niet opnieuw ontwerpen zonder aanleiding.
- Testresultaten, goedkeuring en LIVE altijd afzonderlijk vastleggen.

**Einde masterregister — 18 oktober 2026.**
