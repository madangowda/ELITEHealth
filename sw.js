
const CACHE_NAME = 'elite-coach-vault-v1';
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'manifest.json',
  'index.tsx',
  'types.ts',
  'utils.ts',
  'constants.ts',
  'App.tsx'
];

// 1. Install Phase: Pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Vault: Localizing App Shell...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate Phase: Clean up old versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Interceptor: The core of host-independence
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // CRITICAL: Never cache Gemini AI calls - they need live internet
  if (url.hostname.includes('generativelanguage.googleapis.com')) {
    return;
  }

  // Handle Range Requests for Videos
  if (event.request.headers.get('range')) {
    event.respondWith(handleRangeRequest(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return from cache if we have it
      if (cachedResponse) {
        if (navigator.onLine) {
          fetch(event.request).then((networkResponse) => {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }).catch(() => {});
        }
        return cachedResponse;
      }

      // If not in cache, fetch and cache
      return fetch(event.request).then((networkResponse) => {
        // Cache standard assets and esm modules
        if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || url.hostname.includes('esm.sh') || url.pathname.includes('/attach/'))) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
    })
  );
});

// Helper for Video Range Requests
async function handleRangeRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    const rangeHeader = request.headers.get('range');
    const fullBuffer = await cachedResponse.arrayBuffer();
    const rangeMatch = /bytes=(\d+)-(\d+)?/.exec(rangeHeader);
    
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : fullBuffer.byteLength - 1;
      const chunk = fullBuffer.slice(start, end + 1);
      
      return new Response(chunk, {
        status: 206,
        statusText: 'Partial Content',
        headers: new Headers({
          'Content-Type': cachedResponse.headers.get('Content-Type'),
          'Content-Range': `bytes ${start}-${end}/${fullBuffer.byteLength}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunk.byteLength,
        }),
      });
    }
  }

  // Fallback to network if not in cache or range fails
  return fetch(request);
}
