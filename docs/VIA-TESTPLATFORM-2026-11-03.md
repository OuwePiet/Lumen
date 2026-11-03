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
