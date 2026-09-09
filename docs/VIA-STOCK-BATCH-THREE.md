# VIA stock review — batch three

Status: historical social/community material checked against the current viadeso.online baseline while the Social build track continues in parallel.

## Directly adopted

- Visitor-controlled social entry instead of one compulsory feed.
- Preserve the established DeSo feed lanes: Hot, Following, Recent, Welcome and First Posts.
- Keep a composer track with text, media/embed, poll, emoji and Save Draft.
- Keep public social reading separate from wallet-authorized write actions.
- Treat mobile and tablet as first-class use cases.

## Implemented in this batch

- VIA Social now has a device-local feed preference control for Following, Recent and Discovery.
- The preference is stored only in browser localStorage and does not change follows, profiles or DeSo state.
- Local-only draft writing remains available without publishing or signing.
- Planned DeSo feed lanes remain visibly marked as planned rather than being presented as live data.

## Historical ideas deliberately adapted or rejected

Several later historical documents proposed silent derived-key transactions, central platform-wallet signing, storing a platform seed phrase in server environment configuration and automated blockchain actions without a fresh explicit user decision. Those patterns are not imported into VIA.

VIA keeps the useful goal — low-friction use — but preserves the stronger boundary already established in the project: public-key display is not wallet authority, seed phrases/private keys are not collected by VIA, and blockchain writes require an explicit verified signing flow and clear user intent.

Historical claims such as guaranteed two-second cross-app sync, zero-cost guarantees, automatic verification badges, fully silent bids and always-successful background commerce are treated as aspirational source material, not implementation requirements.

## Still later / discussion

- Live Following / Recent / Hot reads from current DeSo endpoints.
- Welcome and First Posts ranking rules, including anti-spam behavior.
- Replies, quotes, reposts, likes, Diamonds and follow/unfollow writes.
- Private messaging after current DeSo messaging/security verification.
- Media upload and poll publishing.
- External commerce/chat integrations such as WhatsApp Business.
- Automated auctions, sponsored gas or platform-funded transaction flows.

These require current protocol/API verification, wallet/security design, cost review or explicit product discussion before activation.

viadeso.online remains the baseline. Historical project names and third-party comparison language are inventory context only; the platform is VIA.
