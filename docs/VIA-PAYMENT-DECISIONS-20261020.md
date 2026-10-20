# VIA — betaalopzet en nog vereiste aansluiting, 20 oktober 2026

Gebruikersrichting: euro en bitcoin kunnen als ingang dienen, waarna daadwerkelijke omwisseling/settlement in DESO of een nog te verduidelijken dollarvorm plaatsvindt. Ontvangst voor VIA-diensten via @OuwePiet; vanaf circa USD 5 vrij beschikbaar VIA-saldo gewenste doorstorting naar @DeSoMunt. Dit is een gewenste flow, geen bewijs van aangesloten provider of toestemming om in deze ontwikkelsessie echte transacties te ondertekenen.

Geen vervanging van NFT-verkoper, creatorroyalty of bestaande Diamond-ontvanger door @OuwePiet: dienstontvangsten en NFT-verkoopopbrengsten zijn verschillende geldstromen. Bestaande transactietargets blijven intact.

Nog expliciet te beantwoorden:
- Betekent dollar DESO met dollarindicatie, fiat-USD of een concrete stablecoin op een bepaalde keten?
- Welke reeds beschikbare betaal-/wisseldienst verwerkt EUR/BTC en betaalt DESO/USD uit? Koersweergave alleen converteert geen geld.
- Welke VIA-behandelingsvergoeding wordt goedgekeurd? De bestaande 5%- en 2-centvoorbeelden zijn geen vastgesteld live tarief.
- Welke opslagdienst levert de kleine opslag die VIA mag doorberekenen, zonder dat VIA zelf vooraf capaciteit huurt? Arweave-providerkosten en VIA-handeling apart houden; niet dezelfde betaling dubbel innen.

Veilige uitvoering vóór live inschakelen:
1. Ontvangst, omwisseling, settlement, terugbetaling en opslaglevering krijgen afzonderlijke serverstatussen met duurzame referenties.
2. Korte vaste offerte: bronkoers, EUR/USD/BTC/DESO-bedragen, vervaltijd, provider-/netwerk-/VIA-kosten en netto uitbetaling. Geen schijnbare USD-betaling tonen als alleen DESO wordt verzonden.
3. Dienst pas leveren na geverifieerde betaling/settlement. Geauthenticeerde callbacks, idempotentie, herstel voor timeout, gedeeltelijke betaling, vervallen offerte en mislukte conversie.
4. Doorstorting uitsluitend op vrij beschikbare VIA-ontvangsten na kosten en reserveringen; niet blind op de volledige persoonlijke walletsaldowaarde. Bron- en doelpublieke sleutels vóór activering verifiëren. Geen automatische signing vanuit browser, seeds of onbeveiligde serverkey.
5. Eén vlucht per betaal-/doorstortactie, onzekere status duurzaam blokkeren, readback vóór herhalen. Geen gelijktijdig proces dat opnieuw doorstort. Stopknop en herstelprocedure.
6. Arweave-opslag vereist een eigen betaal-/uploadbewijs en controle van het opgeleverde bestand; DESO-NFT-registratie bewijst geen mediabestandopslag.

Eigen VIA-opslag huren en wederverhuren blijft toekomstwerk. Geen provideraccount geopend, tarief geïnd, gelden geconverteerd of doorstorting uitgevoerd.

Vercel: https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage noemt betalingsverwerking en verkoopaanbod als commerciële voorbeelden; vrijwillige donaties zijn uitgezonderd. Operationele verkoop/opslagcheckout kan daarom niet als Hobby-conform worden beloofd enkel door bescheiden presentatie. Voor live activering passend plan of duidelijkheid van Vercel nodig; niets automatisch opwaarderen.