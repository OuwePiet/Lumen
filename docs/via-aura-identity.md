# VIA Aura Identity — vaste regels

Datum vastgelegd: 18-09-2026

## Doel
VIA presenteert DeSo-profielinformatie op een eigen, originelere, mooiere en controleerbare manier. VIA verzint geen statussen en neemt geen DeSo-verificatie over.

## Statusmarkeringen

### Blauw vinkje — DeSo Verified
- Komt uitsluitend uit de openbare DeSo-profieldata.
- VIA kan dit vinkje niet toekennen.
- VIA kan dit vinkje niet wijzigen.
- VIA kan dit vinkje niet verwijderen.
- Bij aanraken/klik verschijnt uitleg dat dit originele DeSo-verificatie is.

### Grijs vinkje — 90+ dagen inactief
- Wordt alleen getoond wanneer VIA uit openbare DeSo-data betrouwbaar kan vaststellen dat er minstens 90 dagen geen openbare DeSo-activiteit is geweest.
- Als de benodigde datum niet betrouwbaar beschikbaar is, toont VIA geen grijze status.
- De grijze status vervangt het blauwe DeSo-vinkje niet; beide feiten kunnen naast elkaar bestaan.
- Bij nieuwe aantoonbare openbare activiteit vervalt de inactiefstatus.

### VIA-blaadje — VIA Recognition
- Is een eigen VIA-erkenning en geen DeSo-verificatie.
- Wordt verdiend door aantoonbare positieve betrokkenheid bij VIA volgens vaste VIA-criteria.
- Is niet te koop.
- Wordt niet automatisch aan ieder account gegeven.
- Wordt pas zichtbaar zodra VIA de erkenning betrouwbaar en controleerbaar kan vaststellen.
- Bij aanraken/klik verschijnt een korte uitleg.

## Profielpresentatie
- Echte DeSo-avatar/foto gebruiken.
- Rijke VIA Aura Card op profielpagina.
- Compacte identiteit in header/home.
- Geen dubbele avatar.
- Rustige luxe glasstijl in VIA-groen, donker en zilver.
- Statusinformatie moet op iPhone/iPad met aanraken en op desktop met klik/toetsenbord uitlegbaar zijn.

## DeSo-verjaardag
- VIA gebruikt de term **Verjaardag** voor de datum waarop het profiel voor het eerst aantoonbaar op DeSo is ontstaan via de eerste profielupdate/BirthBlock.
- We tonen bijvoorbeeld: **Verjaardag · 18-09-2026**.
- VIA berekent deze datum pas zodra de BirthBlock/first-profile-update bron betrouwbaar is geïmplementeerd.
- Niet vervangen door een verzonnen of afgeleide datum uit de eerste post.

## Implementatiestatus
- 90-dagen publieke activiteitsbron toegevoegd op branch `via-aura-status-90d`.
- VIA statuscomponent toegevoegd met blauw verified, grijs inactive en voorbereid VIA-blaadje.
- Blauw en grijs kunnen gelijktijdig zichtbaar zijn.
- Uitleg-popovers zijn meertalig en werken via aanraken/klik/toetsenbord.
- VIA-blaadje is technisch voorbereid maar wordt niet getoond zonder echte VIA Recognition-bron.


## Livegangregel voor VIA Recognition
- VIA Recognition staat technisch achter `VIA_RECOGNITION_ENABLED = false`.
- Deze schakelaar blijft **OFF** tijdens ontwikkeling, testen en pre-launch.
- Het groene VIA-blaadje mag pas worden geactiveerd wanneer VIA werkelijk klaar is voor publieke livegang.
- Voor inschakelen moeten de erkenningscriteria en de bron waarmee VIA die criteria controleert nog één keer expliciet worden beoordeeld.
- Een DeSo-login, DeSo-verificatie, profielbezoek of handmatige styling mag het VIA-blaadje nooit automatisch activeren.
- Dit punt is een verplichte launch-check en mag niet uit de voorraad verdwijnen.

## Zichtbaarheid vóór livegang
- De compacte VIA Aura-identiteit blijft wél zichtbaar vóór livegang: echte DeSo-avatar in een herkenbare glazen VIA-tegel.
- De blauwe DeSo-verificatie en de grijze 90-dagen-inactiefstatus worden alleen getoond wanneer de openbare DeSo-bron dat betrouwbaar ondersteunt.
- Het VIA-blaadje blijft verborgen totdat de bovenstaande livegangregel bewust wordt vrijgegeven.


## Vertrouwde blauwe-vinkjesynchronisatie
- VIA kent het blauwe vinkje nooit zelf toe.
- VIA controleert meerdere vaste DeSo-ecosysteembronnen voor verificatie, zodat een profiel niet afhankelijk is van slechts één node.
- De huidige vertrouwde bronnen zijn: DeSo/reference node, Diamond, DeSocialWorld en SafetyNet/MyDeSoSpace.
- Als minstens één vertrouwde bron het profiel als verified teruggeeft, toont VIA het blauwe vinkje.
- De controle gebeurt opnieuw bij het laden/verversen van het openbare profiel; nieuwe verificaties kunnen daardoor automatisch in VIA doorlopen.
- Een onbekende willekeurige node telt niet mee. Daarmee voorkomen we dat iemand via een eigen node zichzelf bij VIA blauw maakt.
- De bronlijst blijft expliciet beheerd en moet bij veranderingen in het DeSo-ecosysteem opnieuw worden gecontroleerd.


## Vaste visuele uitvoering — profiel en compacte identiteit
Deze uitvoering is definitief vastgelegd en mag niet opnieuw worden ontworpen zonder expliciet overleg.

### Grote VIA Aura Card
- Wordt gebruikt op de profielpagina.
- Toont echte DeSo-avatar/foto, naam en @naam.
- Toont het blauwe DeSo-vinkje wanneer de betrouwbare DeSo-bron dat aangeeft.
- Toont het grijze inactief-vinkje alleen volgens de vastgelegde 90-dagenregel.
- Toont het vaste VIA-blaadje uitsluitend als VIA Recognition volgens de afzonderlijke erkenningsregels.
- Toont rollen zoals Creator / Collector waar van toepassing.
- Toont `DeSo since · [datum]` alleen wanneer de echte DeSo Birthday/BirthBlock/first-profile-update datum betrouwbaar beschikbaar is.
- De tijdelijke ontwerptekst `On DeSo since BitClout` is geen dat bron en mag niet als vaste profieltekst worden gebruikt.

### Compacte VIA Aura-balk
- Wordt gebruikt bij posts, reacties en Notifications waar de grote kaart niet past.
- Toont avatar/foto, @naam en dezelfde statusmarkeringen als de grote kaart.
- De compacte uitvoering gebruikt geen afwijkende betekenis of alternatieve iconenset.

### Vast VIA-blaadje
- De merk-/keurvorm is exact het bestaande bestand `/via-leaf.svg`.
- Vorm en vaste kleur van dit blaadje mogen niet worden gewijzigd zonder expliciet overleg.
- Alleen de lokale presentatie eromheen (bijvoorbeeld subtiele Aura-ring/achtergrond) mag voor deze statusweergave passend worden afgestemd.
- Bestaande toepassingen, waaronder NFT-watermerk en andere merktoepassingen, blijven ongewijzigd.
