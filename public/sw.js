const CACHE = 'my-stars-v7-parents';
const SHELL = ['/', '/index.html', '/styles.css', '/app.js', '/config.js', '/manifest.webmanifest', '/icons/icon.svg', '/delight-v5.css', '/delight-v5.js', '/day-guard-v6.js', '/star-catch-v6.css', '/star-catch-v6.js', '/parents-v7.css', '/parents-v7.js'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('my-stars-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (!SHELL.includes(url.pathname)) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);
      if (response.ok && response.type !== 'opaque') {
        const cache = await caches.open(CACHE);
        await cache.put(event.request, response.clone());
      }
      return response;
    } catch (_) {
      const saved = await caches.match(event.request);
      if (saved) return saved;
      if (event.request.mode === 'navigate') return (await caches.match('/index.html')) || Response.error();
      return Response.error();
    }
  })());
});
