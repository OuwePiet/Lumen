# Eén DeSo Identity-sessie voor VIA

De login gebruikt de vastgepinde `deso-protocol` 3.4.1 SDK. De homepage en gedeelde header gebruiken `viaModernIdentity`. De actieve SDK-account (`desoActivePublicKey` met een geregistreerde SDK-gebruiker in `desoIdentityUsers`) is de enige bron voor de actieve VIA-account. Oude `viaActivePublicKey`/`identityUsersV2`-gegevens mogen deze selectie niet overschrijven. Een uitsluitend oude sessie moet één keer via de SDK worden aangemeld; oude credentials worden niet stilzwijgend geconverteerd of gewist.

Login gebruikt de officiële SDK-redirect naar `https://identity.deso.org`, met terugkeer naar de homepage van **dezelfde origin**. Hiermee is de login op telefoon, tablet en desktop niet afhankelijk van popup-openers of iframe-cookieopslag. De SDK verwerkt de callback zelf; VIA verwijdert na React-hydratatie eventueel teruggezette callbackparameters zonder de callback opnieuw uit te voeren. Leesmodus en paginanavigatie starten nooit automatisch een login of toestemmingsaanvraag.

## Contract voor huidige en toekomstige pagina's

```tsx
"use client"
import { useViaIdentitySession } from "../use-via-identity-session"

export default function ExamplePage() {
  const session = useViaIdentitySession()
  return <p>{session ? `Actieve account: ${session.publicKey}` : "Publieke leesmodus"}</p>
}
```

- Gebruik deze hook of `viaModernIdentity.subscribe` voor sessieafhankelijke UI. Lees niet eenmalig een oude sleutel bij mount en maak geen eigen login-popup, sessieopslag of accountselectie.
- Gebruik `viaModernIdentity` voor SDK-permissies, JWT, signing en berichten. Een sessie is geen onbeperkte transactietoestemming. Extra toestemming blijft nodig wanneer een concrete actie die aantoonbaar vereist.
- Bind accountafhankelijke requests aan `session.publicKey`; annuleer oude requests en wis oude accountgegevens bij accountwisseling of uitloggen. Een publiek bekeken ander profiel is geen verandering van actieve account.
- Controleer voor iedere schrijfactie opnieuw de actieve account en verwerp een accountwisseling tijdens async werk. Financiële herhaalbeveiliging en onzekerheidsregistratie zijn afzonderlijke verplichtingen; een geslaagde login bewijst geen veilige financiële submit.
- Root layout en gedeelde accountbediening gelden ook voor nieuwe routes. Route-servercode mag browseropslag of een opgegeven publieke sleutel nooit als eigendomsbewijs gebruiken. Behoud de toepasselijke server-side JWT-controles.

Accountwisseling, SDK-events, storage-events van andere tabbladen, focus en pageshow houden de sessie synchroon. Lokaal uitloggen verwijdert beide actieve selecties en laat bestaande credentials en financiële onzekerheidsrecords intact. Dit is VIA uitloggen, geen intrekking van een DeSo derived key bij de blockchain.

Browseropslag is per origin en browserprofiel. Eén login geldt voor alle VIA-routes op die origin, niet automatisch voor een tweede domein, ander apparaat of andere browser. Gebruik bij acceptatie steeds het gekozen VIA-domein. Fysieke iPhone/iPad/Safari-acceptatie moet afzonderlijk worden vastgelegd.

## Veilige validatie

`node --test tests/via-platform-login.test.cjs tests/via-world-clock-hydration.test.cjs` voert regressietests uit met financiële mocks en een echte SDK-redirectcontrole zonder financiële API-aanroepen.

`tests/via-platform-login.browser.cjs` gebruikt Playwright, een lokale productiebuild en synthetische accounts. Gebruik een geïnstalleerde Playwright-module, eventueel via `NODE_PATH`; stel `VIA_TEST_BASE` en `VIA_TEST_OUTPUT` in indien nodig. Alle browser-API-writes zijn geblokkeerd, behalve expliciet gemockte read-only POST-contracten. De officiële Identity-pagina wordt onderschept. Dit bewijst UI-, SDK-callback- en sessiesamenwerking, geen echte login, financiële toestemming of fysieke apparaattest.

Deze wijziging overlapt de login-/sessieonderdelen van de oudere open PR-keten en het iPhone-menuonderdeel van #1473. Integreer deze niet blind over elkaar: controleer de uiteindelijke gedeelde adapter en sessiebron. De klokoplossing hergebruikt het bestaande gedrag uit #1455; die reparatie hoeft niet opnieuw te worden ontworpen.
