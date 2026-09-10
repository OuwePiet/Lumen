# VIA DeSo Funding Verification

Before VIA displays a concrete funding or buy-$DESO instruction for a new participant, verify the current official DeSo flow.

## Verify

1. Which current DeSo login/account-creation route VIA should open.
2. Which restrictions apply to a newly created account with insufficient balance.
3. Whether DeSo currently requires or merely offers a $DESO purchase/funding step for the actions VIA wants to unlock.
4. The current official buy/funding destination and supported payment methods.
5. Whether the required amount is fixed, dynamic or action-dependent.
6. What VIA can safely detect without asking for private keys or seed words.

## Implementation rule

Until these points are verified, VIA may say that participation goes through DeSo and that DeSo may require funding for actions. VIA must not hard-code a minimum purchase, promise that payment makes an account trusted, or create its own substitute entrance fee.

Once verified, connect the current DeSo path behind the reusable participation gate and keep the value/provider details replaceable so a DeSo policy change does not require redesigning VIA.
