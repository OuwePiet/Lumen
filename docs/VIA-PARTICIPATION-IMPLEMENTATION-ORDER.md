# VIA Participation Implementation Order

1. Keep all existing public read-only discovery operational.
2. Verify the current official DeSo authentication/account/funding route.
3. Add one reusable authenticated DeSo session/control state; do not infer it from a public key.
4. Use the reusable participation gate on actual write controls.
5. Add server-side/routed validation and rate limiting for VIA-controlled write surfaces where applicable.
6. Activate Social writes incrementally and test each action separately.
7. Only then activate Show Your Stuff submissions and First Maker Space creation.
8. Keep NFT/payment/blockchain actions on the stronger transaction-consent-signing boundary regardless of social login state.

Do not introduce a second VIA participation account merely to accelerate this sequence.
