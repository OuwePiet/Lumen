# VIA Wereldkalender — integratie werkversie 20

Status: **voorbereid, NIET geïntegreerd, NIET getest in VIA, NIET gedeployed**.

## Bestaande productiecode behouden
- Bestaande route: `app/wereldkalender/page.tsx`.
- Bestaande bronnen: `app/via-international-calendar`, `app/via-papal-calendar`, `app/via-calendar-offline-dates`, `app/via-calendar-regions`, `app/via-local-settings`.
- Geen nieuwe route, geen wijziging aan DeSo Identity, Postkantoor of NFT.

## Bronpakket
Eigenaar leverde `VIA_Wereldkalender_Werkversie_20_Te_Integreren.zip` in de ChatGPT-conversatie van 9 november 2026. Het ZIP-bestand is **niet** in deze GitHub-branch geüpload. De bestanden moeten eerst via een geautoriseerde binaire upload of uit de originele broncode worden overgebracht. De standalone `index.html` is niet geschikt om zonder aanpassing de bestaande Next.js-route te overschrijven.

## Integratie en acceptatie
1. Vergelijk componenten en evenementdata met bestaande kalender; geen dubbele pauselijke events.
2. Implementeer wereldbol, agenda en informatietoren in de bestaande Next.js-route, met mobiele indeling en toegankelijkheid.
3. Zorg voor lokale fallback wanneer de 3D-library of externe kalenderbron niet laadt; meld echte foutoorzaak.
4. Behoud publieke toegang zonder DeSo-login. Controleer CSP, externe scripts, bronlinks en XSS/SSRF.
5. Bezoekersinzendingen mogen niet direct publiceren; moderatie vereist server-side authenticatie en audit.
6. Updates via goedgekeurde, versiegebonden data; geen betaalde fetch of cache-write per bezoek.
7. Test iPad Safari, iPhone en Windows, knoppen, spraakfallback, periodeweergave, export, privacy en kosten.
8. Geen merge/deploy zonder afzonderlijke goedkeuring van eigenaar.

Deze branch is uitsluitend een veilige werkruimte; geen PR aangemaakt.
