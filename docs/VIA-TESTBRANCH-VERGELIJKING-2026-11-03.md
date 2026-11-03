# Bestaande testbranch versus nieuwe GitHub-aanvullingen — 3 november 2026

Testbranch op Samsung: fix/postoffice-nft-release-20261101

- app/manifest.ts ← origin/fix/via-small-safe-integration-20261101: VERSCHILLEND; GitHub 32 regels, laptop 31 regels; laatst 25d2bfe8 Use exact VIA NFT watermark for app icons (#897)
- app/nft-view.tsx ← origin/fix/via-small-safe-integration-20261101: VERSCHILLEND; GitHub 697 regels, laptop 703 regels; laatst 6106163e fix(nft): show all on-chain royalty recipients and complete totals
- lib/via/nft-royalty-metadata.ts ← origin/fix/via-small-safe-integration-20261101: VERSCHILLEND; GitHub 50 regels, laptop 71 regels; laatst 6106163e fix(nft): show all on-chain royalty recipients and complete totals
- app/radio/page.tsx ← origin/fix/via-small-safe-integration-20261101: VERSCHILLEND; GitHub 102 regels, laptop 100 regels; laatst 6e72d7b3 Keep World Radio compact and action-first (#1051)
- app/radio/radio-localizer.tsx ← origin/fix/via-small-safe-integration-20261101: VERSCHILLEND; GitHub 213 regels, laptop 175 regels; laatst 0b4a7cab Enable Hindi across VIA (#912)
- app/social/post-composer.tsx ← origin/fix/via-attribution-labels-20261101: VERSCHILLEND; GitHub 379 regels, laptop 381 regels; laatst 8a9bb9d4 fix: finish compact Post Office and NFT workspace navigation
- app/social/public-posts.tsx ← origin/fix/via-attribution-labels-20261101: VERSCHILLEND; GitHub 602 regels, laptop 586 regels; laatst 8a9bb9d4 fix: finish compact Post Office and NFT workspace navigation

## Gerichte delta tegen actuele main


### origin/fix/via-small-safe-integration-20261101

diff --git a/app/manifest.ts b/app/manifest.ts
index ced023be..d430e177 100644
--- a/app/manifest.ts
+++ b/app/manifest.ts
@@ -4,6 +4,7 @@ export default function manifest(): MetadataRoute.Manifest {
   return {
     name: "VIA — DeSo social, creators & NFTs",
     short_name: "VIA",
+    id: "/",
     description: "VIA on DeSo: social, creators, communities, digital culture and NFTs.",
     start_url: "/",
     scope: "/",
diff --git a/app/nft-view.tsx b/app/nft-view.tsx
index a97bc517..838631b4 100644
--- a/app/nft-view.tsx
+++ b/app/nft-view.tsx
@@ -28,6 +28,8 @@ type DeSoPost = {
   ImageURLs?: string[]
   VideoURLs?: string[]
   NumNFTCopies?: number
+  NFTRoyaltyToCreatorBasisPoints?: number
+  NFTRoyaltyToCoinBasisPoints?: number
   HasUnlockable?: boolean
   PosterPublicKeyBase58Check?: string
   TimestampNanos?: number
@@ -495,7 +497,7 @@ export default async function NFTView({
         Boolean(post.PosterPublicKeyBase58Check),
     }
     const utility = readUtilityMetadata(postExtraData)
-    const royalties = readRoyaltyMetadata(postExtraData)
+    const royalties = readRoyaltyMetadata(post)
     const royaltyLabel =
       royalties.source === "unavailable"
         ? "Not available"
diff --git a/app/radio/page.tsx b/app/radio/page.tsx
index e4ac2d7b..c7376b1f 100644
--- a/app/radio/page.tsx
+++ b/app/radio/page.tsx
@@ -86,7 +86,9 @@ export default function WorldRadioPage() {
 
         <p style={styles.eyebrow}>World Radio</p>
         <h1 style={styles.heading} className="via-radio-page-heading">Listen around the world.</h1>
+        <p style={styles.intro} className="via-radio-page-intro">Discover public internet radio by country or genre. Station metadata comes from the Radio Browser directory; when you press Play, audio is requested directly from the station and is not hosted or proxied by VIA.</p>
         <RadioBrowser />
+        <p style={styles.notice} className="via-radio-page-notice">World Radio is separate from VIA LIVE. Radio is for station listening; VIA LIVE is for community conversations and later replays. Availability and rights remain the responsibility of each station or stream provider.</p>
 
         <style>{`\n          @media (max-width: 720px) {\n            .via-radio-page { padding: 14px 16px 96px !important; }
              .via-radio-page-top { margin-bottom: 8px !important; gap: 8px !important; }
diff --git a/app/radio/radio-localizer.tsx b/app/radio/radio-localizer.tsx
index 1537c2c7..992ab0ca 100644
--- a/app/radio/radio-localizer.tsx
+++ b/app/radio/radio-localizer.tsx
@@ -6,6 +6,12 @@ import { readViaLocalSettings, VIA_SETTINGS_EVENT, type ViaLanguage } from "../v
 type Copy = Record<string, string>
 
 const dutch: Copy = {
+  "Station name": "Zendernaam",
+  "Station, e.g. Radio 538": "Zender, bijv. Radio 538",
+  "Genre": "Genre",
+  "Genre, e.g. jazz": "Genre, bijv. jazz",
+  "Stop": "Stoppen",
+  "World Radio station discovery": "Wereldradiozenders zoeken",
   "Back to VIA": "Terug naar VIA",
   "World Radio": "Wereldradio",
   "Listen around the world.": "Luister de wereld rond.",
@@ -29,6 +35,14 @@ const dutch: Copy = {
 }
 
 const french: Copy = {
+  "Discover public internet radio by country or genre. Station metadata comes from the Radio Browser directory; when you press Play, audio is requested directly from the station and is not hosted or proxied by VIA.": "Découvrez les radios publiques sur Internet par pays ou par genre. Les informations sur les stations proviennent de Radio Browser ; lorsque vous lancez la lecture, le flux audio vient directement de la station et n’est ni hébergé ni relayé par VIA.",
+  "World Radio is separate from VIA LIVE. Radio is for station listening; VIA LIVE is for community conversations and later replays. Availability and rights remain the responsibility of each station or stream provider.": "La Radio mondiale est distincte de VIA LIVE. La radio sert à écouter des stations ; VIA LIVE est destiné aux échanges de la communauté et aux rediffusions futures. La disponibilité et les droits relèvent de chaque station ou fournisseur de flux.",
+  "Station name": "Nom de la station",
+  "Station, e.g. Radio 538": "Station, par ex. Radio 538",
+  "Genre": "Genre",
+  "Genre, e.g. jazz": "Genre, par ex. jazz",
+  "Stop": "Arrêter",
+  "World Radio station discovery": "Recherche de stations de radio",
   "Back to VIA": "Retour à VIA",
   "World Radio": "Radio mondiale",
   "Listen around the world.": "Écoutez le monde entier.",
@@ -46,6 +60,14 @@ const french: Copy = {
 }
 
 const spanish: Copy = {
+  "Discover public internet radio by country or genre. Station metadata comes from the Radio Browser directory; when you press Play, audio is requested directly from the station and is not hosted or proxied by VIA.": "Descubre emisoras públicas de radio por Internet según el país o el género. Los datos proceden del directorio Radio Browser; al pulsar Reproducir, el audio se solicita directamente a la emisora y VIA no lo aloja ni lo retransmite.",
+  "World Radio is separate from VIA LIVE. Radio is for station listening; VIA LIVE is for community conversations and later replays. Availability and rights remain the responsibility of each station or stream provider.": "La Radio mundial es independiente de VIA LIVE. La radio permite escuchar emisoras; VIA LIVE está destinado a conversaciones de la comunidad y futuras repeticiones. Cada emisora o proveedor del flujo es responsable de su disponibilidad y derechos.",
+  "Station name": "Nombre de la emisora",
+  "Station, e.g. Radio 538": "Emisora, p. ej. Radio 538",
+  "Genre": "Género",
+  "Genre, e.g. jazz": "Género, p. ej. jazz",
+  "Stop": "Detener",
+  "World Radio station discovery": "Buscar emisoras de radio",
   "Back to VIA": "Volver a VIA",
   "World Radio": "Radio mundial",
   "Listen around the world.": "Escucha alrededor del mundo.",
@@ -63,6 +85,14 @@ const spanish: Copy = {
 }
 
 const chinese: Copy = {
+  "Discover public internet radio by country or genre. Station metadata comes from the Radio Browser directory; when you press Play, audio is requested directly from the station and is not hosted or proxied by VIA.": "按国家或类型探索公开的网络电台。电台信息来自 Radio Browser 目录；点击播放后，音频直接从电台获取，VIA 不托管或转发音频。",
+  "World Radio is separate from VIA LIVE. Radio is for station listening; VIA LIVE is for community conversations and later replays. Availability and rights remain the responsibility of each station or stream provider.": "世界电台与 VIA LIVE 相互独立。世界电台用于收听广播；VIA LIVE 用于社区交流及未来的回放。各电台或流媒体提供方自行负责可用性和相关权利。",
+  "Station name": "电台名称",
+  "Station, e.g. Radio 538": "电台，例如 Radio 538",
+  "Genre": "类型",
+  "Genre, e.g. jazz": "类型，例如爵士乐",
+  "Stop": "停止",
+  "World Radio station discovery": "搜索广播电台",
   "Back to VIA": "返回 VIA",
   "World Radio": "世界电台",
   "Listen around the world.": "聆听世界各地。",
@@ -80,6 +110,14 @@ const chinese: Copy = {
 }
 
 const hindi: Copy = {
+  "Discover public internet radio by country or genre. Station metadata comes from the Radio Browser directory; when you press Play, audio is requested directly from the station and is not hosted or proxied by VIA.": "देश या शैली के अनुसार सार्वजनिक इंटरनेट रेडियो खोजें। स्टेशन की जानकारी Radio Browser निर्देशिका से आती है; चलाएँ दबाने पर ऑडियो सीधे स्टेशन से प्राप्त होता है, VIA उसे होस्ट या प्रॉक्सी नहीं करता।",
+  "World Radio is separate from VIA LIVE. Radio is for station listening; VIA LIVE is for community conversations and later replays. Availability and rights remain the responsibility of each station or stream provider.": "विश्व रेडियो, VIA LIVE से अलग है। रेडियो स्टेशन सुनने के लिए है; VIA LIVE समुदाय की बातचीत और भविष्य के रीप्ले के लिए है। उपलब्धता और अधिकारों की जिम्मेदारी संबंधित स्टेशन या स्ट्रीम प्रदाता की है।",
+  "Station name": "स्टेशन का नाम",
+  "Station, e.g. Radio 538": "स्टेशन, जैसे रेडियो 538",
+  "Genre": "शैली",
+  "Genre, e.g. jazz": "शैली, जैसे जैज़",
+  "Stop": "रोकें",
+  "World Radio station discovery": "रेडियो स्टेशन खोजें",
   "Back to VIA": "VIA पर वापस जाएँ",
   "World Radio": "विश्व रेडियो",
   "Listen around the world.": "दुनिया भर के रेडियो सुनें।",
diff --git a/lib/via/nft-royalty-metadata.ts b/lib/via/nft-royalty-metadata.ts
index 9ef8b615..9b00b4c4 100644
--- a/lib/via/nft-royalty-metadata.ts
+++ b/lib/via/nft-royalty-metadata.ts
@@ -19,19 +19,31 @@ function firstNumber(data: Record<string, unknown>, keys: string[]) {
   }
 }
 
+function record(value: unknown) {
+  return value && typeof value === "object"
+    ? (value as Record<string, unknown>)
+    : undefined
+}
+
 /**
- * Reads known royalty fields without assuming they exist on every legacy NFT.
+ * Reads the official DeSo NFT royalty fields from the post response. Legacy
+ * metadata remains a fallback for older VIA records that do not expose them.
  * Values still pass through the strict 0–10000 basis-point normalizer.
  */
-export function readRoyaltyMetadata(extraData: unknown): ViaRoyaltyInfo {
-  if (!extraData || typeof extraData !== "object") {
+export function readRoyaltyMetadata(post: unknown): ViaRoyaltyInfo {
+  const data = record(post)
+  if (!data) {
     return normalizeRoyaltyInfo({})
   }
 
-  const data = extraData as Record<string, unknown>
+  const metadata = record(data.PostExtraData) ?? record(data.ExtraData)
   return normalizeRoyaltyInfo({
-    creatorBasisPoints: firstNumber(data, CREATOR_KEYS),
-    coinBasisPoints: firstNumber(data, COIN_KEYS),
+    creatorBasisPoints:
+      firstNumber(data, CREATOR_KEYS) ??
+      (metadata ? firstNumber(metadata, CREATOR_KEYS) : undefined),
+    coinBasisPoints:
+      firstNumber(data, COIN_KEYS) ??
+      (metadata ? firstNumber(metadata, COIN_KEYS) : undefined),
     source: "deso-nft",
   })
 }


### origin/fix/via-attribution-labels-20261101

diff --git a/app/social/post-composer.tsx b/app/social/post-composer.tsx
index dcfb12af..49adcc83 100644
--- a/app/social/post-composer.tsx
+++ b/app/social/post-composer.tsx
@@ -295,7 +295,7 @@ export default function PostComposer({ parentStakeID = "", compact = false, onDo
       <label htmlFor={isReply ? `via-reply-${parentStakeID}` : "via-post-body"} className="sr-only">{isReply ? "Reply" : "Post"}</label>
       {!session ? <p className="mb-2 text-sm text-zinc-500">DeSo login is required to publish. You can prepare your post first.</p> : null}
       <div className="relative mt-2">
-        {!isReply ? <span className="pointer-events-none absolute left-3 top-2 z-10 text-[10px] tracking-[0.08em] text-zinc-600">Gepost via VIA</span> : null}
+        <span className="pointer-events-none absolute left-3 top-2 z-10 text-[10px] tracking-[0.08em] text-zinc-600">{isReply ? "Reply via VIA" : "Post via VIA"}</span>
         <textarea ref={textareaRef} id={isReply ? `via-reply-${parentStakeID}` : "via-post-body"} value={body} onChange={(event) => { setBody(event.target.value); setDraftMessage(""); if (status === "done" || status === "error") { setStatus("idle"); setMessage("") } }} maxLength={MAX_POST_LENGTH} rows={compact ? 3 : 5} placeholder={isReply ? "Write a reply…" : "What do you want to share?"} className={`min-h-[8rem] w-full border border-zinc-800 bg-zinc-950 px-3 pb-7 pt-7 text-sm text-zinc-100 outline-none transition-[min-height] focus:min-h-[16rem] focus:border-[#8fd4a9]/55 sm:min-h-0 sm:focus:min-h-0 ${imagePreviews.length || imageUrls.length ? "rounded-t-xl rounded-b-none border-b-0" : "rounded-xl"}`} />
         {!isReply && body.length < 4900 ? <span aria-hidden="true" className="pointer-events-none absolute bottom-2 right-3 text-[10px] text-zinc-700">max. 5000 tekens</span> : null}
         {body.length >= 4900 ? <span className="pointer-events-none absolute bottom-2 right-3 text-[10px] text-zinc-500" aria-live="polite">{body.length.toLocaleString()} / {MAX_POST_LENGTH.toLocaleString()}</span> : null}
diff --git a/app/social/public-posts.tsx b/app/social/public-posts.tsx
index 2b0ebf89..377a31d1 100644
--- a/app/social/public-posts.tsx
+++ b/app/social/public-posts.tsx
@@ -32,6 +32,7 @@ type PublicPost = {
   quoteRepostCount: number
   isNft: boolean
   postExtraData?: Record<string, string>
+  parentStakeID?: string
   sourcePublicKey?: string
   comments?: PublicPost[]
 }
@@ -495,7 +496,7 @@ export default function PublicPosts() {
                   <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm leading-6 text-zinc-200">{post.body.length > 420 && !expandedPosts[post.postHash] ? `${post.body.slice(0, 420).trimEnd()}…` : post.body}</p>
                   {post.body.length > 420 ? <button type="button" onClick={() => setExpandedPosts((current) => ({ ...current, [post.postHash]: !current[post.postHash] }))} aria-expanded={Boolean(expandedPosts[post.postHash])} className="mt-1 text-sm font-semibold text-[#9adbb2] hover:underline">{expandedPosts[post.postHash] ? "Minder tonen" : "Lees verder …"}</button> : null}
                 </div> : <p className="mt-3 text-sm text-zinc-500">Media post</p>}
-                {postedViaVIA ? <p className="mt-1 text-[11px] text-zinc-500">Gepost via VIA</p> : null}
+                {postedViaVIA ? <p className="mt-1 text-[11px] text-zinc-500">Post via VIA</p> : null}
 
                 {images.length ? (
                   <div className="mt-4 grid gap-2 sm:grid-cols-2">
@@ -578,7 +579,7 @@ ${url}`
                 {options.length >= 2 ? <PollVoteControl postHash={post.postHash} options={options} /> : null}
                 {isReplying ? <section className="mt-3 space-y-3 rounded-xl border border-zinc-700 p-3" aria-label="DeSo replies">
                   <div className="flex items-center justify-between"><strong className="text-sm">DeSo replies</strong><button type="button" onClick={() => { setReplyingTo(null); setReplyParent(null) }} aria-label="Close replies">×</button></div>
-                  {commentsBusy ? <p>Loading replies…</p> : commentsError ? <p role="alert">DeSo replies unavailable. <button type="button" onClick={() => setCommentsRefresh(n => n + 1)}>Retry</button></p> : commentPosts.length === 0 ? <p>No replies returned by DeSo.</p> : commentPosts.map(comment => <div key={comment.postHash} className="rounded-lg border border-zinc-800 p-2 text-sm"><p className="text-zinc-400">{comment.username ? `@${comment.username}` : shortPublicKey(comment.publicKey)}</p><p className="whitespace-pre-wrap break-words">{comment.body}</p>{comment.comments?.map(child => <div key={child.postHash} className="ml-4 mt-2 border-l border-zinc-700 pl-3"><p className="text-zinc-400">{child.username ? `@${child.username}` : shortPublicKey(child.publicKey)}</p><p className="whitespace-pre-wrap break-words">{child.body}</p><div className="mt-2 flex flex-wrap items-center gap-2"><button type="button" onClick={() => setReplyParent(child.postHash)}>Reply</button>{session ? <><RepostButton postHash={child.postHash} initialCount={child.repostCount + child.quoteRepostCount} variant="icon" />{session.publicKey !== child.publicKey ? <DiamondButton postHash={child.postHash} receiverPublicKey={child.publicKey} initialCount={child.diamondCount} variant="icon" /> : <span>Diamonds · {child.diamondCount}</span>}<LikeButton postHash={child.postHash} initialCount={child.likeCount} initialLiked={child.isLikedByReader} variant="icon" /><ReplyExtraActions reply={child} /></> : <><button type="button" title="Repost (DeSo login required)" onClick={() => setActionLoginPost(child.postHash)}>Repost · {child.repostCount + child.quoteRepostCount}</button><button type="button" title="Diamond (DeSo login required)" onClick={() => setActionLoginPost(child.postHash)}>Diamond · {child.diamondCount}</button><button type="button" title="Like (DeSo login required)" onClick={() => setActionLoginPost(child.postHash)}>Like · {child.likeCount}</button><ReplyExtraActions reply={child} /></>}<ReplyLoginNotice replyHash={child.postHash} /><ReplyTranslation reply={child} /></div></div>)}<div className="flex flex-wrap gap-2"><button type="button" onClick={() => setReplyParent(comment.postHash)}>Reply</button>{session ? <><RepostButton postHash={comment.postHash} initialCount={comment.repostCount + comment.quoteRepostCount} variant="icon" />{session.publicKey !== comment.publicKey ? <DiamondButton postHash={comment.postHash} receiverPublicKey={comment.publicKey} initialCount={comment.diamondCount} variant="icon" /> : <span>Diamonds · {comment.diamondCount}</span>}<LikeButton postHash={comment.postHash} initialCount={comment.likeCount} initialLiked={comment.isLikedByReader} variant="icon" /><ReplyExtraActions reply={comment} /></> : <><button type="button" title="Repost (DeSo login required)" onClick={() => setActionLoginPost(comment.postHash)}>Repost · {comment.repostCount + comment.quoteRepostCount}</button><button type="button" title="Diamond (DeSo login required)" onClick={() => setActionLoginPost(comment.postHash)}>Diamond · {comment.diamondCount}</button><button type="button" title="Like (DeSo login required)" onClick={() => setActionLoginPost(comment.postHash)}>Like · {comment.likeCount}</button><ReplyExtraActions reply={comment} /></>}<ReplyLoginNotice replyHash={comment.postHash} /><ReplyTranslation reply={comment} /></div></div>)}
+                  {commentsBusy ? <p>Loading replies…</p> : commentsError ? <p role="alert">DeSo replies unavailable. <button type="button" onClick={() => setCommentsRefresh(n => n + 1)}>Retry</button></p> : commentPosts.length === 0 ? <p>No replies returned by DeSo.</p> : commentPosts.map(comment => <div key={comment.postHash} className="rounded-lg border border-zinc-800 p-2 text-sm"><p className="text-zinc-400">{comment.username ? `@${comment.username}` : shortPublicKey(comment.publicKey)}</p><p className="whitespace-pre-wrap break-words">{comment.body}</p>{comment.postExtraData?.ViaClient === "viadeso.online" ? <p className="mt-1 text-[11px] text-zinc-500">Reply via VIA</p> : null}{comment.comments?.map(child => <div key={child.postHash} className="ml-4 mt-2 border-l border-zinc-700 pl-3"><p className="text-zinc-400">{child.username ? `@${child.username}` : shortPublicKey(child.publicKey)}</p><p className="whitespace-pre-wrap break-words">{child.body}</p>{child.postExtraData?.ViaClient === "viadeso.online" ? <p className="mt-1 text-[11px] text-zinc-500">Reply via VIA</p> : null}<div className="mt-2 flex flex-wrap items-center gap-2"><button type="button" onClick={() => setReplyParent(child.postHash)}>Reply</button>{session ? <><RepostButton postHash={child.postHash} initialCount={child.repostCount + child.quoteRepostCount} variant="icon" />{session.publicKey !== child.publicKey ? <DiamondButton postHash={child.postHash} receiverPublicKey={child.publicKey} initialCount={child.diamondCount} variant="icon" /> : <span>Diamonds · {child.diamondCount}</span>}<LikeButton postHash={child.postHash} initialCount={child.likeCount} initialLiked={child.isLikedByReader} variant="icon" /><ReplyExtraActions reply={child} /></> : <><button type="button" title="Repost (DeSo login required)" onClick={() => setActionLoginPost(child.postHash)}>Repost · {child.repostCount + child.quoteRepostCount}</button><button type="button" title="Diamond (DeSo login required)" onClick={() => setActionLoginPost(child.postHash)}>Diamond · {child.diamondCount}</button><button type="button" title="Like (DeSo login required)" onClick={() => setActionLoginPost(child.postHash)}>Like · {child.likeCount}</button><ReplyExtraActions reply={child} /></>}<ReplyLoginNotice replyHash={child.postHash} /><ReplyTranslation reply={child} /></div></div>)}<div className="flex flex-wrap gap-2"><button type="button" onClick={() => setReplyParent(comment.postHash)}>Reply</button>{session ? <><RepostButton postHash={comment.postHash} initialCount={comment.repostCount + comment.quoteRepostCount} variant="icon" />{session.publicKey !== comment.publicKey ? <DiamondButton postHash={comment.postHash} receiverPublicKey={comment.publicKey} initialCount={comment.diamondCount} variant="icon" /> : <span>Diamonds · {comment.diamondCount}</span>}<LikeButton postHash={comment.postHash} initialCount={comment.likeCount} initialLiked={comment.isLikedByReader} variant="icon" /><ReplyExtraActions reply={comment} /></> : <><button type="button" title="Repost (DeSo login required)" onClick={() => setActionLoginPost(comment.postHash)}>Repost · {comment.repostCount + comment.quoteRepostCount}</button><button type="button" title="Diamond (DeSo login required)" onClick={() => setActionLoginPost(comment.postHash)}>Diamond · {comment.diamondCount}</button><button type="button" title="Like (DeSo login required)" onClick={() => setActionLoginPost(comment.postHash)}>Like · {comment.likeCount}</button><ReplyExtraActions reply={comment} /></>}<ReplyLoginNotice replyHash={comment.postHash} /><ReplyTranslation reply={comment} /></div></div>)}
                   <button type="button" onClick={() => setCommentsRefresh(n => n + 1)} disabled={commentsBusy}>Refresh replies</button>
                   {session ? <PostComposer key={replyParent ?? post.postHash} parentStakeID={replyParent ?? post.postHash} compact onCancel={() => setReplyParent(null)} onDone={() => setReplyParent(null)} /> : <p>Sign in with DeSo to reply.</p>}
                 </section> : null}

