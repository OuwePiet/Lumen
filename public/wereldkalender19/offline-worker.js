/* @OuwePiet 2026 — opt-in public calendar offline fallback, scoped to /wereldkalender19/. */
const CACHE = 'via-public-calendar-offline-v1';
const OFFLINE = '/wereldkalender19/offline.html';
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || req.mode !== 'navigate') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname !== '/wereldkalender19/index.html') return;
  event.respondWith(fetch(req).catch(async () => (await caches.open(CACHE)).match(OFFLINE).then(response => response || Response.error())));
});
self.addEventListener('message', event => {
  if (!event.source || !event.ports || !event.ports[0]) return;
  // Reject messages from other same-origin pages or unrelated frames.
  const clientUrl = event.source.url;
  if (typeof clientUrl !== 'string') return;
  const sender = new URL(clientUrl);
  if (sender.origin !== self.location.origin || sender.pathname !== '/wereldkalender19/index.html') return;
  const reply = event.ports[0];
  if (event.data === 'SAVE_OFFLINE') {
    event.waitUntil(caches.open(CACHE).then(cache => cache.add(OFFLINE)).then(() => reply.postMessage({ok:true})).catch(() => reply.postMessage({ok:false})));
  } else if (event.data === 'REMOVE_OFFLINE') {
    event.waitUntil(caches.delete(CACHE).then(() => reply.postMessage({ok:true})).catch(() => reply.postMessage({ok:false})));
  }
});