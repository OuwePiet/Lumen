# VIA Storage — customer payment rule

Status: current VIA product rule

## Fixed rule

VIA does not structurally subsidize storage required for a creator/customer NFT or storage service.

When a creator/customer action requires paid external storage, that creator/customer pays the VIA customer price before the paid storage service is activated.

This includes storage needed specifically for that customer's NFT/media flow when it cannot use a no-cost route chosen by the creator.

## Public price board

The public VIA storage price board shows the **final customer price**: the amount the creator/customer pays VIA for the selected storage tier/service.

It is not an internal accounting board and must not expose internal margin calculations as extra customer charges.

Historical tier sizes remain inventory until their final customer prices are approved against current verified supplier costs.

## Internal settlement

For each paid storage transaction:

1. creator/customer pays VIA;
2. VIA settles the applicable storage supplier/provider cost and applicable transaction/payment cost;
3. the remaining storage/service amount belongs to VIA;
4. VIA proceeds are directed under the platform's approved funds policy toward OuwePiet.

The customer price must therefore be sufficient to cover the real supplier/payment cost and leave the intended small VIA service remainder. VIA should not promise or activate paid storage when confirmed customer funds are insufficient.

## NFT boundary

Ordinary NFT media remains choice-based:

- DeSo media route where supported within the verified technical limit;
- IPFS/managed external storage where selected/required;
- creator-controlled external Link where valid.

Paid VIA storage is not forced when a valid creator-controlled/no-paid-VIA route is available. But if VIA must purchase external storage for that creator/customer NFT flow, that cost belongs to that creator/customer transaction, not to VIA as a subsidy.

## Accounting separation

Keep these values distinct internally:

- customer price;
- supplier/provider cost;
- payment/network cost where applicable;
- VIA remainder.

Only the approved customer price belongs on the public price board. Supplier cost and VIA remainder are internal settlement/accounting data unless VIA deliberately publishes a transparency breakdown later.

## Safety

This rule does not authorize wallet signing, automatic supplier payment, automatic DESO sweep, custody, or secret-key handling. Those actions require their separately approved secure implementation.
