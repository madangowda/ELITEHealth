const CACHE_NAME = 'elite-coach-v3';
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

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

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Do not cache API calls
  if (url.hostname.includes('generativelanguage.googleapis.com')) return;

  // Handle Video streaming separately
  if (url.pathname.includes('/attach/')) {
    event.respondWith(handleVideoFetch(event.request));
    return;
  }

  // Standard Cache-First for local assets, Network-First for others
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).then((networkResponse) => {
        // Cache successful local requests
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') return caches.match('index.html');
      });
    })
  );
});

async function handleVideoFetch(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request.url);

  if (!cachedResponse) {
    try {
      const response = await fetch(request.url);
      if (response.status === 200) {
        await cache.put(request.url, response.clone());
        return serveRange(request, response);
      }
      return response;
    } catch (e) {
      return new Response('Offline: Video not cached', { status: 503 });
    }
  }

  return serveRange(request, cachedResponse);
}

async function serveRange(request, fullResponse) {
  const rangeHeader = request.headers.get('range');
  if (!rangeHeader) return fullResponse;

  const fullBuffer = await fullResponse.arrayBuffer();
  const rangeMatch = /bytes=(\d+)-(\d+)?/.exec(rangeHeader);
  if (!rangeMatch) return fullResponse;

  const start = parseInt(rangeMatch[1], 10);
  const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : fullBuffer.byteLength - 1;
  const chunk = fullBuffer.slice(start, end + 1);

  return new Response(chunk, {
    status: 206,
    statusText: 'Partial Content',
    headers: new Headers({
      'Content-Type': fullResponse.headers.get('Content-Type') || 'video/mp4',
      'Content-Range': `bytes ${start}-${end}/${fullBuffer.byteLength}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunk.byteLength,
    }),
  });
}