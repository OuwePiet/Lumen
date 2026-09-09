# VIA Accessibility Baseline

Accessibility is a VIA platform requirement, not a premium feature or optional afterthought.

## Baseline

- Responsive layouts must remain usable on phone, tablet, laptop and desktop.
- Interactive controls need meaningful labels and visible focus states.
- Keyboard use must not be blocked where normal web controls can support it.
- Text and important controls require readable contrast.
- Do not rely on colour alone to communicate state.
- Avoid autoplay audio/video.
- Respect reduced-motion preferences when motion is introduced.
- Avoid unnecessary infinite-scroll dependence; provide understandable navigation/pagination where practical.
- Error, loading and empty states should explain what is happening in ordinary language.
- Important actions must not depend solely on hover.
- Touch targets should be comfortably usable on mobile devices.

## Media

Where the content permits it, VIA should support useful alternative text/captions/transcripts rather than treating accessibility metadata as decoration. Automated captions/descriptions must be labelled appropriately when their accuracy is not guaranteed.

## Safety and transactions

Accessibility must not weaken transaction safety. Blockchain/payment actions still require clear amount/action/recipient information and explicit confirmation. VIA never silently signs transactions.

## Release rule

New visitor-facing VIA environments should be checked against this baseline before being treated as complete. Accessibility problems that prevent normal use are release issues, not cosmetic backlog.
