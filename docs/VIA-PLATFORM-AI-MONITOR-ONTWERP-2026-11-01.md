# VIA Platform AI — ontwerp, controlecontract en vrijgavepoort

Datum: 2026-11-01  
Status: **concept ter beoordeling; geen toestemming tot implementatie, betaling, merge of productie**.

## Doel
Een gratis of aantoonbaar kostenarme, dagelijkse VIA-bewaker die bestaande controlepunten en GitHub/Vercel-status **uitsluitend leest**, bevindingen met bewijs rapporteert en verbeteringen ter goedkeuring voorlegt. De bestaande dagelijkse ChatGPT-taak is al ingeschakeld; bouw geen dubbele scheduler.

## Bestaande broncode op main
- `app/api/via/health/route.ts`: VIA/DeSo reachability via `get-app-state` (4,5s); mediaUpload en mediaRetrieval zijn **UNKNOWN**.
- `app/api/via/deso-health/route.ts`: operationele DeSo-nodeprobe via `get-exchange-rate` (4s), primair/fallback. Bereikbaarheid is geen consensusgarantie.
- `lib/via/deso-health.ts`: gedeelde nodekeuzehelper; vergelijk selectiecontract met route.
- `app/api/via/payment-readiness/health/route.ts`: serverconfiguratie van betaalroutes, **geen echte transactieproef**.
- `lib/via/payment-readiness-server.ts`: algemene DESO-betaalroute hard uitgeschakeld (`desoOperational: false`); dit is geen uitspraak over afzonderlijke bestaande DeSo diamonds/NFT-acties.
- `app/payment-status/page.tsx` en `docs/VIA-TEST-STRATEGY-AUDIT.md`: bestaande presentatie en testgrenzen.

## Eén controlecontract (voorstel, nog niet implementeren)
Per bevinding:
```json
{
  "component": "deso-node",
  "status": "OK",
  "checkType": "reachability",
  "checkedAt": "ISO-8601 UTC",
  "source": "bestaand health-endpoint of GitHub/Vercel",
  "evidenceUrl": "https://...",
  "commitSha": "optioneel",
  "durationMs": 123,
  "severity": "info",
  "confidence": "confirmed",
  "recommendation": "geen wijziging nodig",
  "requiresApproval": true
}
```
Statuswaarden: `OK`, `DEGRADED`, `FAILED`, `UNKNOWN`, `NOT_TESTED`. Een niet uitgevoerde controle is nooit `OK`. De resultaten zijn een **tijdgebonden momentopname**, geen uptime- of beveiligingsgarantie. Alleen publiek veilige informatie tonen; geen credentials, walletadressen, privégebruikersdata, signed payloads of configuratiegeheimen.

## Scope per dag
1. Bereikbaarheid VIA-productie en actuele GitHub main/PR/checks; exacte bron en commit vastleggen.
2. DeSo nodes, Identity en login **alleen voor zover veilig en zonder accountondertekening meetbaar**.
3. Postkantoor, notificaties, NFT, LuisterHoek, KunstHoek, Luisterboeken, Wereldradio, Wereldkalender en spelpagina's: alleen openbare route-/rendercontroles; geen schijnclaim van functionele E2E-tests.
4. Betaalstatus en diamonds/NFT-betalingen **uitsluitend read-only**, onderscheid configuratie, constructie, ondertekening, broadcast en on-chain bevestiging.
5. Zes bestaande talen EN/NL/FR/ES/ZH/HI; compacte responsieve weergave op iPhone, iPad en desktop.
6. Vercel cache-, bandwidth- en functiegebruik: **geen onbewezen kostenbedragen**; controleer gratis limieten en actuele tarieven voor inschakeling.
7. Nieuwe technieken en verbeteringen: bron, licentie, veiligheids- en kostenrisico plus verwachte winst.

## Veiligheids- en kostenregels
- Geen autonome PR, commit, merge, deploy, productie-instelling, betaling, upload, walletactie of extra externe dienst.
- Alleen voorstel voor Codex; **expliciete gebruikersgoedkeuring** vereist vóór elke wijziging. Productiemerge is een afzonderlijke goedkeuring en vereist afgesproken groene checks.
- Geen oneindige polling; limieten voor requests, timeouts en rapportlengte. Hergebruik bestaande controlepunten.
- Geen betaalde AI API of 24/7 agent zonder prijsopgave en toestemming. 'Gratis' betekent **geen nieuw betaald verbruik**; bestaande GitHub/Vercel/ChatGPT-quotas kunnen alsnog limieten kennen.
- Meld alleen nieuw of gewijzigd bewijs; herhaal niet iedere dag dezelfde openstaande bevindingen zonder relevante verandering.
- Verifieer dat health-checks geen geheimen lekken en dat geautomatiseerde probes niet tot DDoS-/kostenrisico leiden.

## Geplande implementatie, na afzonderlijk akkoord
A. **Inventarisatie**: concrete routes, health-contracten, bestaande tests, GitHub/Vercel-quotas, risico's en gapmatrix.
B. **Tests en read-only rapport**: statusnormalisatie, UNKNOWN/NOT_TESTED-fallback, minimale probes en mocks; geen echte blockchaintransacties.
C. **Compacte VIA Platform AI-pagina**: alleen indien navigatie akkoord; zes talen, mobiel en toegankelijk.
D. **Voorstellen ter goedkeuring**: prioriteit, bewijs, kosten, betrokken bestanden, testplan, terugdraaimogelijkheid.
E. **Vrijgave**: pas na expliciete toestemming, tests, twee relevante groene deployments en afzonderlijk merge-akkoord.

## Acceptatiecriteria
- Alle bestaande routes blijven werken; geen duplicatie van scheduler of Identity.
- Alle vijf statuswaarden en bewijsvelden gedekt door tests.
- `mediaUpload=UNKNOWN` en `mediaRetrieval=UNKNOWN` worden nooit groen gepresenteerd.
- Readiness is geen betalingstest; DESO payment boundary blijft ongewijzigd.
- Geen netwerktransactie, private key, accountactie of verborgen externe kosten.
- Mobile/tablet/desktop en alle zes talen bij UI-uitbreiding.
- Regressie-, typecheck- en buildresultaten aantoonbaar vóór vrijgave.

## Beslispunt
Dit document is uitsluitend een voorstel. Eerst een controleerbare gapmatrix van Codex, daarna akkoord op concrete kleine implementatie-PR's. **Deze documentatie-PR niet automatisch samenvoegen.**
