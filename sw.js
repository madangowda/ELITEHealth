
const CACHE_NAME = 'elite-coach-v3-permanent';

// We pre-cache the core logic and the CDN dependencies
const PRE_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.tsx',
  '/types.ts',
  '/utils.ts',
  '/constants.ts',
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@^19.2.3',
  'https://esm.sh/react-dom@^19.2.3/',
  'https://esm.sh/lucide-react@^0.562.0',
  'https://esm.sh/@google/genai@^1.34.0'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Building Offline Vault...');
      return cache.addAll(PRE_CACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Strategy: Cache First, then Network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Don't cache if not a success or if it's the AI API call
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && !event.request.url.includes('esm.sh')) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // If everything fails (no net + no cache), show the index as fallback
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
