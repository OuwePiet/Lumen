# VIA Herhaalpost — technische en functionele overdracht
Status: UITGEWERKT / NIET GEBOUWD / NIET GETEST / NIET LIVE
Datum: 19 november 2026
Eigenaar: @OuwePiet 2026
Branch: feature/via-herhaalpost-spec-20261119

## Doel
Een creator of adverteerder kan tegen een vooraf zichtbare kleine vergoeding een bestaand DeSo-bericht herhaald onder de aandacht brengen op VIA. VIA ontvangt de geverifieerde vergoeding rechtstreeks; VIA financiert geen on-chain transacties. Focus betaalde reposts zijn een *inspiratiebron*, niet automatisch een beschikbare API of een bewezen transactiemodel.

## Bestaande voorzieningen die eerst worden hergebruikt
- `app/advertising/page.tsx`: bestaande sponsorplaatsen (vier op homepage, maximaal twaalf voorkeurplaatsen op advertentiepagina); vrijwillige sponsoring is uitdrukkelijk geen gekochte advertentieplaats.
- `app/advertising/advertising-directory.tsx`: bestaande advertentieweergave.
- `app/api/via/checkout-order/route.ts`: bestaande NFT-gerichte orderflow, niet zomaar hergebruiken voor campagnebetalingen; geen nieuwe checkout zolang verificatie ontbreekt.
- DeSo Identity 3.4.1: één homepage-login, beperkte machtigingen, geen custody.
- Postkantoor: bestaande postkaart en repostbediening; niet opnieuw bouwen.
- VIA-Emporium: toekomstige commerciële ingang, geen tweede advertentiebeheersysteem.

## Twee strikt verschillende producten
A. VIA-uitlichting (MVP): een bestaand, openbaar, gecontroleerd DeSo-bericht wordt op geplande momenten in een duidelijk gelabelde VIA-ruimte opnieuw getoond. Geen nieuwe DeSo-post, geen derived-key schrijfbevoegdheid, geen on-chain fee per vertoning. Dit is *geen* nieuwe vermelding in DeSo-volgersfeeds.
B. Echte DeSo-repost (latere optionele fase): afzonderlijke expliciete machtiging van de creator, transacties door diens wallet/derived key, spending limits, transactie-idempotentie, on-chain kosten bij creator; geen stilzwijgende automatisering. Eerst DeSo-protocol, nodegedrag en Identity 3.4.1 controleren.

## Voorstel tarieven — niet vastgesteld
Per herhaling: $0,05 / $0,10 / $0,25, configureerbaar door eigenaar; 2/4/8 herhalingen, dagelijks/wekelijks/iedere 30 dagen. Prijzen zijn voorbeelden, geen live aanbod. Valuta USD als rekeneenheid; DESO/BTC/fiat pas tonen wanneer een veilige geverifieerde ontvangst- en koersroute bestaat. Transactiekosten en wisselkoers vooraf zichtbaar. Nooit beloven dat $0,05 rendabel is voordat betaalfees zijn vastgesteld. Vergoedingen rechtstreeks naar VIA-eigen ontvangstbestemming, uitsluitend via server-gevalideerde configuratie; geen ontvangstadres in clientcode of deze documentatie opnemen.

## Campagnevelden (server-authoritatief)
```ts
type CampaignStatus = "draft"|"pending_review"|"awaiting_payment"|"scheduled"|"active"|"paused"|"completed"|"rejected"|"expired"|"refunded"|"payment_review";
type PlacementKind = "via_highlight"|"deso_repost";
type Campaign = {
  id: string; ownerPublicKey: string; postHashHex: string;
  placement: PlacementKind; sponsored: boolean;
  frequencyDays: 1|7|30; maxOccurrences: 2|4|8;
  priceMinorUnits: number; currency: "USD";
  startAt: string; expiresAt: string; nextDueAt: string;
  completedOccurrences: number; status: CampaignStatus;
  paymentReference: string|null; paymentVerifiedAt: string|null;
  createdAt: string; updatedAt: string;
};
type Occurrence = {
  id: string; campaignId: string; ordinal: number;
  scheduledAt: string; completedAt: string|null;
  status: "due"|"claimed"|"published"|"skipped"|"failed";
  idempotencyKey: string; postHashHex: string;
};
```
Unique constraints: campaign paymentReference (per provider/chain); occurrence (campaignId, ordinal); idempotencyKey. Store an append-only event log for approvals, payments, pauses and publications. The authoritative store must be durable and shared across deployments; **localStorage, Vercel memory and ephemeral files are not sufficient**. Determine whether existing VIA/DeSo-based storage can safely support private campaign administration and scheduling; do not add paid infrastructure without approval.

## User flow
1. Homepage login (Identity 3.4.1) -> open own public post -> 'Herhaalpost'.
2. Select placement (MVP VIA-uitlichting), frequency, number, start date and optional sponsor label. Show total price, limits, service terms and on-chain distinction.
3. Server verifies DeSo post exists, ownership or authorized advertiser permission, public visibility, content moderation, campaign quotas and calculated authoritative price.
4. Request enters pending_review. Owner/moderator approves or rejects. No active campaign until both approval and payment confirmation.
5. Generate a unique payment reference; verify amount, recipient, chain confirmations and uniqueness **server-side**. Client-side receipt screenshot/transaction hash alone is insufficient.
6. Schedule occurrences after payment confirmation. At each due slot, display original post in an approved VIA placement with 'Gesponsord' where relevant, owner attribution and link to original.
7. User dashboard shows remaining slots, next time, total paid, status, Pause/Stop; owner dashboard can approve, reject, pause and audit. No refund promise unless explicit policy is implemented.
8. When occurrence limit or expiry is reached, mark completed. Never auto-renew or auto-charge.

## Scheduler and idempotency
- One shared bounded scheduled job (not one job per campaign) may scan due campaigns, but only after confirming current Vercel plan, quotas, cron security and shared durable storage.
- Each occurrence must be claimed atomically using a unique (campaignId,ordinal) constraint. Retries must not double-publish or double-charge.
- Stale locks must expire safely. Rate limit per creator, post, campaign and global placement. No campaign may crowd out organic posts.
- Pause/stop before due time blocks the occurrence; never treat display impression as an on-chain repost.
- Do not depend on visitor logins or a browser remaining open to advance schedules.
- Provide a deterministic local clock/scheduler test harness with mocked storage before enabling live jobs.

## Security and policy
- Only verified public posts. Avoid private DMs, deleted content, unsafe links, illegal or deceptive advertising.
- No automatic diamonds, artificial engagement, fabricated view counts or reward farming.
- Sponsored content visibly labeled; preserve the original author and source.
- Creator's explicit consent required for reposting another person's post; no assumed rights from payment.
- CSRF, authorization by verified DeSo public key, anti-replay, input validation, webhook signatures, secret management and audit logs.
- Spending limits and Identity 3.4.1 must not be expanded for MVP; no stored wallet secrets.
- Payment verification and schedule execution must fail closed; no mock 'success' displayed as real payment.

## Acceptance criteria
[ ] No existing Postkantoor, advertising, Identity or NFT checkout behavior regresses.
[ ] Mobile/iPad/desktop responsive, all six VIA languages, accessible controls.
[ ] User can draft a campaign with exact totals and visible fees.
[ ] Creator/advertiser ownership and moderation are checked server-side.
[ ] Duplicate payment references and occurrence claims are rejected.
[ ] No publication without confirmed payment and approval.
[ ] Each scheduled highlight appears once, clearly labeled, with original author.
[ ] Pause, stop, expiry and failure/retry behavior tested.
[ ] No silent DeSo transactions or wallet prompts in MVP.
[ ] No new recurring infrastructure fees without explicit permission.
[ ] Test branch + preview tested end-to-end before proposing production release.

## Implementation order
P0 audit existing advertising-directory, Postkantoor, Identity 3.4.1, payment-readiness, storage and scheduler.
P1 pure validation/pricing module and UI draft (no payments).
P2 authoritative campaign store, owner approval, idempotent occurrences.
P3 verified payment receiver + sandbox tests.
P4 shared scheduler, status dashboard and responsive/i18n tests.
P5 optional DeSo-repost research only after MVP is proven.

No merge, deploy, cron activation, Codex restart or paid service without owner's authorization.
