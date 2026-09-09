# VIA Social feed state boundary

## Rule
Following, Recent and Discovery are separate public-read contexts. When the visitor changes feed mode, VIA clears the currently rendered posts before another source is loaded.

## Why
This prevents posts loaded from one source from being presented under another active feed label. It also keeps VIA's read-only status copy accurate.

## Safety
This change does not add wallet access, signing, publishing, following, likes, reposts, Diamonds or other blockchain writes.
