// SidkoUniverse Service Worker — network-first, offline-fallback
const CACHE = 'sidko-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Skip cross-origin requests and API calls — always live
  if (url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  // Network-first for navigation; fall back to cache
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r ?? caches.match('/')))
  );
});
