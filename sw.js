// Ophelia Hokkaido 2026 - offline cache
// Cache-first for the app shell + known photos, so the itinerary still opens with no signal.
const CACHE_NAME = 'ophelia-hokkaido-2026-v1';
const PRECACHE_URLS = [
  './',
  './index.html',
  'https://commons.wikimedia.org/wiki/Special:FilePath/JR%20Asahikawa%20Sta.%20-%20panoramio%20(1).jpg?width=800',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Cape%20Soya%2C%20Japan.jpg?width=800',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Wakkanai%20Station%20the-most-northern-station.jpg?width=800',
  'https://commons.wikimedia.org/wiki/Special:FilePath/展望花畑%20四季彩の丘.jpg?width=800',
  'https://commons.wikimedia.org/wiki/Special:FilePath/A%20photograph%20of%20Farm%20Tomita%20across%20the%20flower%20field.jpg?width=800',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Shikotsuko1.jpg?width=800',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(new Request(url, { mode: 'cors' })).catch(() => {})
        )
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => cached);
    })
  );
});
