# VIA Wereldkalender — overdracht en checkpoint (15 oktober 2026)

## Status
- Integratiebranch: `integration/calendar-1467-1469-20261015`
- Pull request: https://github.com/OuwePiet/Lumen/pull/1470
- Laatst gecontroleerde HEAD vóór dit checkpoint: `f499f7d9244764b57812e12377b6fa1004bd2002`
- Vercel-preview op deze HEAD: `lumen-3z-6ikuxvgmv-beleggerpiet-4479s-projects.vercel.app` — READY.
- De PR bundelt oudere kalender-PR's #1467, #1468 en #1469. Niet apart opnieuw mergen.
- Basis van de branch: main `3747aec3ea03c27d3566e1a2ad63a39df68752ce`; 54 commits vooruit, geen commits achter bij controle.

## Gebouwd
- /wereldkalender met zes VIA-interface-talen en landenkeuze (118 landen/gebieden).
- Maandoverzicht, dagselectie, terug naar hele maand, knop Vandaag, wereldtijd, maandnavigatie.
- Lijst verdeeld in pagina's van 8, 16 of 32 gebeurtenissen.
- Internationale vaste data, enkele berekende religieuze/lunaire dagen met indicatie van onzekerheid.
- API /api/via-calendar-holidays: Nager.Date, ondersteunde landen ontdekken, 24-uurscache, wereldwijde parallelle requests, foutmeldingen en brondekking.
- OpenHolidays als gratis aanvullende reservebron voor geselecteerde Europese landen.
- Duplicatenfiltering, regiocodes bij regionale feestdagen, offline nationale fallback, inklapbare bronstatus, laadtoestand.
- Klein dubbel label VIA WORLD verwijderd.

## Nog niet bewezen of niet af
- Geen volledige werelddekking voor alle nationale/culturele/religieuze feestdagen.
- OpenHolidays fallback en complete wereldwijde API-resultaten niet functioneel op runtime getest.
- Geen onafhankelijke automatische dagelijkse achtergrondmonitor; refresh gebeurt bij verzoeken.
- Geen volledige iPhone/Android/iPad/laptop en VIA-Auto test.
- Externe APIs en de cache kunnen falen; bronstatus toont dit.
- Geen bewering dat alle landen volledig zijn ondersteund.
- OpenHolidays fallback haalt vooralsnog enkel eerste datum van meerdaagse observanties op en negeert regio-informatie.
- Wereldwijd ophalen van alle landen tegelijk kan performance- en rate-limitrisico hebben.

## Vervolg
1. Test live API-respons NL, een land buiten Europa, en world; controleer correctheid en performance.
2. Controleer dat de tweede bron werkelijk bruikbare data teruggeeft bij uitval van Nager.Date.
3. Test paginering en iPad-weergave; maak waar nodig gerichte PR's.
4. Bouw monitoring alleen na afweging van Vercel gratis limieten.
5. Wijzig niet de tweede Vercel-omgeving zonder aparte toestemming.

## Publicatieprotocol
Publicatie op main alleen via PR met gecontroleerde groene build; na merge productie- en tweede omgeving verifiëren volgens VIA-afspraken. Geen bewering dat productie werkt zonder productiecheck.
