# VIA NFT — laptoptest en verbeterpunten (21 oktober 2026)

Status: uitsluitend observatie en ontwerpvoorstel. Niet implementeren zonder afzonderlijke toestemming.

## Referentie
Screenshot van de gebruiker: `image(20261021-105905).png` (in ChatGPT ontvangen; niet in deze GitHub-branch opgenomen). Vraag om het originele beeld als Codex het niet kan openen. Screenshot toont VIA op laptop met NFT-collectie van @SeWiJuGA, 11.365 NFT-kopieën verdeeld over 4.296 NFT's, met zoek- en filterbalk en kaartoverzicht.

## Gevraagde wijzigingen
1. Taal: de drie navigatielinks **Homepage**, **Handboek VIA** en **VIA Muziek** moeten de actieve taalkeuze volgen. Gebruik bestaande i18n en behoud de routes.
2. **Find NFT creator**: plaats de huidige verklarende tekst (`Search a public DeSo account and open its NFT collection.`) direct achter de titel, als compacte toelichting. Geen tweede losse regel.
3. Maak het creator-zoekveld smaller, verplaats het hoger en houd de knop **Find creator** direct naast het veld; laat de indeling responsief omslaan bij smalle schermen.
4. Bij het profiel: zet de bestaande eigendomstekst op dezelfde regel als **@SeWiJuGA**, zonder tweede herhaling van de gebruikersnaam. Voorbeeld: `@SeWiJuGA — owns 11,365 NFT copies across 4,296 NFTs`. Gebruik de bestaande dynamische DeSo-data, geen vaste aantallen.
5. Groepeer zoeken, sorteren, verkoopstatus en mediafilters harmonisch en compacter. Bewaar alle filtermogelijkheden, inclusief unavailable, reset, kopieerlink en vernieuwen.
6. Behoud NFT-kaarten, afbeeldingen, bestaande DeSo-koppeling, resultaten en functionaliteit. Geen onnodige eigen VIA-logica.

## Aan Codex
- Inspecteer eerst de huidige componenten, i18n en CSS en vergelijk met screenshot.
- Geef een kort Nederlandstalig voorstel met exacte bestanden, responsieve indeling en regressierisico's.
- **Geen code wijzigen, geen PR, geen merge en geen deployment** zonder nieuwe opdracht.
- Houd de bestaande VIA-regel aan: bij latere toestemming één wijziging per PR, twee Vercel-deployments exact dezelfde SHA groen vóór merge.
